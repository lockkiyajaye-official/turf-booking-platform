import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from '../database/entities/booking.entity';
import { Turf } from '../database/entities/turf.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { In, Repository } from 'typeorm';
import { PaymentsService } from '../payments/payments.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Turf)
    private turfRepository: Repository<Turf>,
    private paymentsService: PaymentsService,
  ) { }

  async create(createBookingDto: CreateBookingDto, user: User) {
    const turf = await this.turfRepository.findOne({
      where: { id: createBookingDto.turfId },
    });

    if (!turf) {
      throw new NotFoundException('Turf not found');
    }

    // Check availability
    const availability = await this.checkAvailability(
      createBookingDto.turfId,
      createBookingDto.bookingDate,
      createBookingDto.startTime,
      createBookingDto.endTime,
    );

    if (!availability.available) {
      throw new BadRequestException(
        availability.reason || 'Slot not available',
      );
    }

    // Calculate total price
    const startHour = parseInt(createBookingDto.startTime.split(':')[0]);
    const endHour = parseInt(createBookingDto.endTime.split(':')[0]);
    const hours = endHour - startHour;
    const totalPrice = turf.pricePerHour * (isNaN(hours) || hours <= 0 ? 1 : hours);

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      bookingDate: new Date(createBookingDto.bookingDate),
      user,
      userId: user.id,
      turf,
      turfId: turf.id,
      totalPrice,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  async findAll(
    user: User,
    options?: {
      page?: number;
      limit?: number;
      status?: BookingStatus | string;
      search?: string;
      turfId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const page = options?.page && options.page > 0 ? Number(options.page) : 1;
    const limit = options?.limit && options.limit > 0 ? Number(options.limit) : 10;
    const skip = (page - 1) * limit;

    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.turf', 'turf');

    if (user.role === UserRole.TURF_OWNER) {
      query.andWhere('turf.ownerId = :ownerId', { ownerId: user.id });
    } else if (user.role !== UserRole.ADMIN) {
      query.andWhere('booking.userId = :userId', { userId: user.id });
    }

    if (options?.turfId) {
      query.andWhere('booking.turfId = :turfId', { turfId: options.turfId });
    }

    if (options?.status && options.status !== 'all') {
      query.andWhere('booking.status = :status', { status: options.status });
    }

    if (options?.search && options.search.trim().length > 0) {
      const searchTerm = `%${options.search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(user.phone) LIKE :search OR LOWER(turf.name) LIKE :search)',
        { search: searchTerm },
      );
    }

    if (options?.startDate) {
      query.andWhere('booking.bookingDate >= :startDate', {
        startDate: new Date(options.startDate),
      });
    }

    if (options?.endDate) {
      query.andWhere('booking.bookingDate <= :endDate', {
        endDate: new Date(options.endDate),
      });
    }

    query.orderBy('booking.createdAt', 'DESC');

    const [items, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasMore,
    };
  }

  async findOne(id: string, user: User) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['user', 'turf', 'turf.owner'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      booking.userId !== user.id &&
      booking.turf.ownerId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    return booking;
  }

  async updateStatus(id: string, status: BookingStatus, user: User) {
    const booking = await this.findOne(id, user);

    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.TURF_OWNER &&
      booking.userId !== user.id
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  /**
   * Calculates cancellation policy eligibility and refund breakdown for a booking.
   */
  async getCancellationPreview(id: string, user: User) {
    const booking = await this.findOne(id, user);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Completed bookings cannot be cancelled');
    }

    const turf = booking.turf;

    // Parse booking start date and time
    const bookingDateStr = booking.bookingDate instanceof Date
      ? booking.bookingDate.toISOString().split('T')[0]
      : String(booking.bookingDate).split('T')[0];

    const startHour = booking.startTime || '00:00';
    const bookingStartTime = new Date(`${bookingDateStr}T${startHour.length === 5 ? startHour + ':00' : startHour}`);

    const now = new Date();
    const diffMs = bookingStartTime.getTime() - now.getTime();
    const hoursRemaining = Math.max(0, diffMs / (1000 * 60 * 60));

    let refundPercentage = 0;
    let ruleApplied = '';
    let policyStatus = 'active';

    if (user.role === UserRole.TURF_OWNER || user.role === UserRole.ADMIN) {
      refundPercentage = 100;
      ruleApplied = '100% Full Refund (Cancelled by Turf Owner)';
    } else if (!turf.cancellationPolicyEnabled) {
      refundPercentage = 0;
      ruleApplied = 'Cancellations and refunds are non-refundable according to turf policy.';
      policyStatus = 'disabled';
    } else if (hoursRemaining >= (turf.fullRefundHours ?? 24)) {
      refundPercentage = 100;
      ruleApplied = `Full refund available (> ${turf.fullRefundHours ?? 24} hours before booking time)`;
    } else if (hoursRemaining >= (turf.partialRefundHours ?? 6)) {
      refundPercentage = turf.partialRefundPercentage ?? 50;
      ruleApplied = `Partial refund (${turf.partialRefundPercentage ?? 50}% refund if cancelled > ${turf.partialRefundHours ?? 6} hours before booking time)`;
    } else {
      refundPercentage = 0;
      ruleApplied = `Non-refundable (Cancelled less than ${turf.partialRefundHours ?? 6} hours before slot)`;
    }

    const totalPrice = Number(booking.totalPrice || 0);
    const refundAmount = Math.round((totalPrice * (refundPercentage / 100)) * 100) / 100;
    const feeAmount = Math.round((totalPrice - refundAmount) * 100) / 100;

    return {
      bookingId: booking.id,
      totalPrice,
      hoursRemaining: Math.round(hoursRemaining * 10) / 10,
      refundPercentage,
      refundAmount,
      feeAmount,
      ruleApplied,
      policyStatus,
      policy: {
        enabled: turf.cancellationPolicyEnabled ?? true,
        fullRefundHours: turf.fullRefundHours ?? 24,
        partialRefundHours: turf.partialRefundHours ?? 6,
        partialRefundPercentage: turf.partialRefundPercentage ?? 50,
      },
    };
  }

  async cancel(id: string, cancelDto: CancelBookingDto | undefined, user: User) {
    const booking = await this.findOne(id, user);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Completed bookings cannot be cancelled');
    }

    const isOwnerOrAdmin = user.role === UserRole.TURF_OWNER || user.role === UserRole.ADMIN;
    let preview = await this.getCancellationPreview(id, user);

    if (isOwnerOrAdmin) {
      preview = {
        ...preview,
        refundPercentage: 100,
        refundAmount: Number(booking.totalPrice || 0),
        ruleApplied: '100% Full Refund (Cancelled by Turf Owner)',
      };
    }

    // Process refund via Razorpay if applicable
    let refundResult = { refunded: false, refundAmount: 0, razorpayRefundId: null as string | null, status: 'none' };
    if (preview.refundAmount > 0) {
      const reason = cancelDto?.reason 
        ? (isOwnerOrAdmin ? `Cancelled by Turf Owner: ${cancelDto.reason}` : cancelDto.reason)
        : (isOwnerOrAdmin ? 'Cancelled by Turf Owner' : 'User requested cancellation');
      const result = await this.paymentsService.processBookingRefund(
        booking.id,
        preview.refundAmount,
        reason,
      );
      refundResult = {
        refunded: result.refunded,
        refundAmount: result.refundAmount,
        razorpayRefundId: result.razorpayRefundId ?? null,
        status: result.status,
      };
    }

    const defaultReason = isOwnerOrAdmin ? 'Cancelled by Turf Owner' : 'User cancelled booking';
    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = cancelDto?.reason ? (isOwnerOrAdmin ? `Cancelled by Owner: ${cancelDto.reason}` : cancelDto.reason) : defaultReason;
    booking.cancelledAt = new Date();
    booking.refundAmount = preview.refundAmount;
    booking.refundStatus = refundResult.status;

    const savedBooking = await this.bookingRepository.save(booking);

    return {
      booking: savedBooking,
      cancellation: {
        reason: booking.cancellationReason,
        cancelledAt: booking.cancelledAt,
        refundAmount: preview.refundAmount,
        refundPercentage: preview.refundPercentage,
        refundStatus: refundResult.status,
        razorpayRefundId: refundResult.razorpayRefundId,
        message: preview.refundAmount > 0
          ? `Booking cancelled successfully. Refund of ₹${preview.refundAmount} initiated via Razorpay.`
          : 'Booking cancelled. As per turf policy, this cancellation is non-refundable.',
      },
    };
  }

  async checkAvailability(
    turfId: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    const turf = await this.turfRepository.findOne({
      where: { id: turfId },
    });

    if (!turf) {
      return { available: false, reason: 'Turf not found' };
    }

    // Check if slot exists in available slots
    const slotString = startTime && endTime ? `${startTime}-${endTime}` : startTime;
    const exists = turf.availableSlots.some((s) => {
      if (s === slotString || s === startTime) return true;
      if (startTime && endTime && (s.includes(startTime) || s.replace(/\s/g, '').includes(slotString.replace(/\s/g, '')))) return true;
      return false;
    });

    if (!exists && turf.availableSlots.length > 0) {
      return { available: false, reason: 'Slot not in available slots' };
    }

    const dateFormatted = date ? date.split('T')[0] : '';

    const activeBookings = await this.bookingRepository.find({
      where: {
        turfId,
        status: In([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
      },
    });

    const isConflicting = activeBookings.some((b) => {
      const bDate = b.bookingDate instanceof Date
        ? b.bookingDate.toISOString().split('T')[0]
        : String(b.bookingDate).split('T')[0];

      if (bDate !== dateFormatted) return false;

      if (startTime && endTime) {
        return (
          (b.startTime === startTime && b.endTime === endTime) ||
          (`${b.startTime}-${b.endTime}` === `${startTime}-${endTime}`) ||
          (`${b.startTime} - ${b.endTime}` === `${startTime} - ${endTime}`)
        );
      }
      return b.startTime === startTime || b.startTime.includes(startTime) || startTime.includes(b.startTime);
    });

    if (isConflicting) {
      return { available: false, reason: 'Slot already booked' };
    }

    return { available: true };
  }
}


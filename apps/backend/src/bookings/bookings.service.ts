import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from 'src/database/entities/booking.entity';
import { Turf } from 'src/database/entities/turf.entity';
import { User, UserRole } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Turf)
    private turfRepository: Repository<Turf>,
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
    const totalPrice = turf.pricePerHour * hours;

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

  async findAll(user: User) {
    if (user.role === UserRole.ADMIN) {
      return this.bookingRepository.find({
        relations: ['user', 'turf'],
      });
    }

    if (user.role === UserRole.TURF_OWNER) {
      return this.bookingRepository.find({
        where: { turf: { ownerId: user.id } },
        relations: ['user', 'turf'],
      });
    }

    return this.bookingRepository.find({
      where: { userId: user.id },
      relations: ['turf'],
    });
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

  async cancel(id: string, user: User) {
    return this.updateStatus(id, BookingStatus.CANCELLED, user);
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
    const slotString = `${startTime}-${endTime}`;
    if (!turf.availableSlots.includes(slotString)) {
      return { available: false, reason: 'Slot not in available slots' };
    }

    // Check for conflicting bookings
    const bookingDate = new Date(date);
    const conflictingBooking = await this.bookingRepository.findOne({
      where: {
        turfId,
        bookingDate,
        startTime,
        endTime,
        status: BookingStatus.CONFIRMED,
      },
    });

    if (conflictingBooking) {
      return { available: false, reason: 'Slot already booked' };
    }

    return { available: true };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, UserRole } from '../database/entities/user.entity';
import { Turf } from '../database/entities/turf.entity';
import { Booking, BookingStatus } from '../database/entities/booking.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Turf)
    private turfRepository: Repository<Turf>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) { }

  async getStatistics(ownerId: string) {
    // Verify user is turf owner
    const turfs = await this.turfRepository.find({
      where: { ownerId },
    });

    if (turfs.length === 0) {
      throw new UnauthorizedException('No turfs found for this owner');
    }

    const turfIds = turfs.map((turf) => turf.id);

    // Get all bookings for owner's turfs
    const allBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.turf', 'turf')
      .where('booking.turfId IN (:...turfIds)', { turfIds })
      .getMany();

    // Calculate statistics
    const totalBookings = allBookings.length;
    const confirmedBookings = allBookings.filter(
      (b) => b.status === BookingStatus.CONFIRMED,
    ).length;
    const pendingBookings = allBookings.filter(
      (b) => b.status === BookingStatus.PENDING,
    ).length;
    const cancelledBookings = allBookings.filter(
      (b) => b.status === BookingStatus.CANCELLED,
    ).length;
    const completedBookings = allBookings.filter(
      (b) => b.status === BookingStatus.COMPLETED,
    ).length;

    // Calculate revenue
    const totalRevenue = allBookings
      .filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED)
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);

    // Get bookings for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBookings = allBookings.filter(
      (b) => new Date(b.bookingDate) >= thirtyDaysAgo,
    );

    const recentRevenue = recentBookings
      .filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED)
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);

    // Get turf statistics
    const totalTurfs = turfs.length;
    const publishedTurfs = turfs.filter((t) => t.isPublished).length;
    const draftTurfs = turfs.filter((t) => t.isDraft).length;

    // Get bookings by turf
    const bookingsByTurf = turfs.map((turf) => {
      const turfBookings = allBookings.filter((b) => b.turfId === turf.id);
      return {
        turfId: turf.id,
        turfName: turf.name,
        totalBookings: turfBookings.length,
        revenue: turfBookings
          .filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED)
          .reduce((sum, b) => sum + Number(b.totalPrice), 0),
      };
    });

    // Get recent bookings (last 10)
    const recentBookingsList = allBookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((b) => ({
        id: b.id,
        turfName: b.turf.name,
        userName: `${b.user.firstName} ${b.user.lastName}`,
        bookingDate: b.bookingDate,
        startTime: b.startTime,
        endTime: b.endTime,
        totalPrice: b.totalPrice,
        status: b.status,
        createdAt: b.createdAt,
      }));

    return {
      overview: {
        totalTurfs,
        publishedTurfs,
        draftTurfs,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        completedBookings,
        totalRevenue,
        recentRevenue,
      },
      bookingsByTurf,
      recentBookings: recentBookingsList,
    };
  }

  async getBookings(ownerId: string, filters?: {
    status?: BookingStatus;
    startDate?: string;
    endDate?: string;
    turfId?: string;
  }) {
    const turfs = await this.turfRepository.find({
      where: { ownerId },
    });

    if (turfs.length === 0) {
      return [];
    }

    const turfIds = turfs.map((turf) => turf.id);
    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.turf', 'turf')
      .where('booking.turfId IN (:...turfIds)', { turfIds });

    if (filters?.status) {
      queryBuilder.andWhere('booking.status = :status', { status: filters.status });
    }

    if (filters?.turfId) {
      queryBuilder.andWhere('booking.turfId = :turfId', { turfId: filters.turfId });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('booking.bookingDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('booking.bookingDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    queryBuilder.orderBy('booking.createdAt', 'DESC');

    return queryBuilder.getMany();
  }
}

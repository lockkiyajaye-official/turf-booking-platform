import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from 'src/database/entities/booking.entity';
import { Turf } from 'src/database/entities/turf.entity';
import { Payment, PaymentStatus } from 'src/database/entities/payment.entity';
import { Payout, PayoutStatus } from 'src/database/entities/payout.entity';
import { User, UserRole } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Turf)
    private turfRepository: Repository<Turf>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Payout)
    private payoutRepository: Repository<Payout>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  /**
   * Admin overview analytics for the global dashboard.
   */
  async getAdminOverview() {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(startOfToday.getDate() - 6);
    const thirtyDaysAgo = new Date(startOfToday);
    thirtyDaysAgo.setDate(startOfToday.getDate() - 29);
    const fourteenDaysAgo = new Date(startOfToday);
    fourteenDaysAgo.setDate(startOfToday.getDate() - 13);
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [payments, bookings, turfs, users, payouts] = await Promise.all([
      this.paymentRepository.find({
        relations: ['turf'],
      }),
      this.bookingRepository.find({
        relations: ['user', 'turf'],
      }),
      this.turfRepository.find({
        relations: ['owner'],
      }),
      this.userRepository.find(),
      this.payoutRepository.find({
        relations: ['owner'],
      }),
    ]);

    const successfulPayments = payments.filter(
      (p) => p.status === PaymentStatus.SUCCESS,
    );

    const totalRevenue = successfulPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    const sumRevenueSince = (since: Date) =>
      successfulPayments
        .filter((p) => p.createdAt >= since)
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const revenueToday = sumRevenueSince(startOfToday);
    const revenueLast7Days = sumRevenueSince(sevenDaysAgo);
    const revenueLast30Days = sumRevenueSince(thirtyDaysAgo);

    const totalBookings = bookings.length;
    const bookingsToday = bookings.filter(
      (b) => b.createdAt >= startOfToday,
    ).length;
    const bookingsLast7Days = bookings.filter(
      (b) => b.createdAt >= sevenDaysAgo,
    ).length;
    const bookingsLast30Days = bookings.filter(
      (b) => b.createdAt >= thirtyDaysAgo,
    ).length;

    const confirmedBookings = bookings.filter(
      (b) => b.status === BookingStatus.CONFIRMED,
    ).length;
    const pendingBookings = bookings.filter(
      (b) => b.status === BookingStatus.PENDING,
    ).length;
    const cancelledBookings = bookings.filter(
      (b) => b.status === BookingStatus.CANCELLED,
    ).length;
    const completedBookings = bookings.filter(
      (b) => b.status === BookingStatus.COMPLETED,
    ).length;

    const totalUsers = users.length;
    const totalTurfOwners = users.filter(
      (u) => u.role === UserRole.TURF_OWNER,
    ).length;
    const totalAdmins = users.filter(
      (u) => u.role === UserRole.ADMIN,
    ).length;

    const newUsers7d = users.filter(
      (u) => u.createdAt >= sevenDaysAgo,
    ).length;
    const newTurfOwners7d = users.filter(
      (u) => u.role === UserRole.TURF_OWNER && u.createdAt >= sevenDaysAgo,
    ).length;

    const totalLiability = users
      .filter((u) => u.role === UserRole.TURF_OWNER)
      .reduce((sum, u) => sum + Number(u.walletBalance || 0), 0);

    const failedPayments24h = payments.filter(
      (p) =>
        p.status === PaymentStatus.FAILED &&
        p.createdAt >= last24h,
    ).length;
    const failedPayments7d = payments.filter(
      (p) =>
        p.status === PaymentStatus.FAILED &&
        p.createdAt >= sevenDaysAgo,
    ).length;

    const payoutsRequested = payouts.filter(
      (p) => p.status === PayoutStatus.REQUESTED,
    ).length;

    const inactiveTurfs = turfs.filter(
      (t) => !t.isActive || !t.isPublished,
    ).length;

    // Top turfs by revenue
    const turfRevenueMap = new Map<
      string,
      {
        turfId: string;
        turfName: string;
        ownerName?: string;
        revenue: number;
        bookings: number;
      }
    >();

    successfulPayments.forEach((p) => {
      const turf = turfs.find((t) => t.id === p.turfId);
      const key = p.turfId;
      if (!turfRevenueMap.has(key)) {
        turfRevenueMap.set(key, {
          turfId: p.turfId,
          turfName: turf?.name || 'Unknown turf',
          ownerName: turf?.owner
            ? `${turf.owner.firstName} ${turf.owner.lastName}`
            : undefined,
          revenue: 0,
          bookings: 0,
        });
      }
      const entry = turfRevenueMap.get(key)!;
      entry.revenue += Number(p.amount);
      entry.bookings += 1;
    });

    const topTurfsByRevenue = Array.from(turfRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    // Simple time-series for last 14 days
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);

    const initSeries = (days: number) => {
      const map: Record<string, number> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(startOfToday);
        d.setDate(startOfToday.getDate() - i);
        map[formatDate(d)] = 0;
      }
      return map;
    };

    const bookingsSeries = initSeries(14);
    bookings
      .filter((b) => b.createdAt >= fourteenDaysAgo)
      .forEach((b) => {
        const key = formatDate(b.createdAt);
        if (bookingsSeries[key] !== undefined) {
          bookingsSeries[key] += 1;
        }
      });

    const revenueSeries = initSeries(14);
    successfulPayments
      .filter((p) => p.createdAt >= fourteenDaysAgo)
      .forEach((p) => {
        const key = formatDate(p.createdAt);
        if (revenueSeries[key] !== undefined) {
          revenueSeries[key] += Number(p.amount);
        }
      });

    const bookingsPerDay = Object.entries(bookingsSeries).map(
      ([date, count]) => ({ date, count }),
    );
    const revenuePerDay = Object.entries(revenueSeries).map(
      ([date, amount]) => ({ date, amount }),
    );

    // Recent activity
    const recentBookings = [...bookings]
      .sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime(),
      )
      .slice(0, 5)
      .map((b) => ({
        id: b.id,
        userName: `${b.user.firstName} ${b.user.lastName}`,
        turfName: b.turf.name,
        amount: Number(b.totalPrice),
        status: b.status,
        createdAt: b.createdAt,
      }));

    const recentPayouts = [...payouts]
      .sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime(),
      )
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        ownerName: p.owner
          ? `${p.owner.firstName} ${p.owner.lastName}`
          : 'Unknown owner',
        amount: Number(p.amount),
        status: p.status,
        createdAt: p.createdAt,
      }));

    const recentTurfOwners = users
      .filter((u) => u.role === UserRole.TURF_OWNER)
      .sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime(),
      )
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        businessName: u.businessName,
        createdAt: u.createdAt,
      }));

    return {
      revenue: {
        total: totalRevenue,
        today: revenueToday,
        last7Days: revenueLast7Days,
        last30Days: revenueLast30Days,
      },
      bookings: {
        total: totalBookings,
        today: bookingsToday,
        last7Days: bookingsLast7Days,
        last30Days: bookingsLast30Days,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings,
        completed: completedBookings,
      },
      users: {
        totalUsers,
        totalTurfOwners,
        totalAdmins,
        newUsers7d,
        newTurfOwners7d,
      },
      wallet: {
        totalLiability,
      },
      alerts: {
        failedPayments24h,
        failedPayments7d,
        payoutsRequested,
        inactiveTurfs,
      },
      topTurfsByRevenue,
      recentActivity: {
        bookings: recentBookings,
        payouts: recentPayouts,
        turfOwners: recentTurfOwners,
      },
      charts: {
        bookingsPerDay,
        revenuePerDay,
      },
    };
  }
}

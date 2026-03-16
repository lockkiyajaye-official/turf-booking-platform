import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

import { Payment, PaymentStatus } from 'src/database/entities/payment.entity';
import { Booking, BookingStatus } from 'src/database/entities/booking.entity';
import { Turf } from 'src/database/entities/turf.entity';
import { User, UserRole } from 'src/database/entities/user.entity';
import { Payout, PayoutStatus } from 'src/database/entities/payout.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class PaymentsService {
    private razorpay: any;

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(Turf)
        private readonly turfRepository: Repository<Turf>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Payout)
        private readonly payoutRepository: Repository<Payout>,
        private readonly configService: ConfigService,
    ) {
        this.razorpay = new Razorpay({
            key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
        });
    }

    /**
     * Create a Razorpay order for a booking and a corresponding Payment record.
     * Industry-standard flow:
     *  - Customer pays the platform's account (your Razorpay account)
     *  - We track how much each turf owner should receive via walletBalance
     *  - Actual bank payouts to owners are done in batches via payouts (future step)
     */
    async createOrder(dto: CreatePaymentDto, user: User) {
        if (user.role !== UserRole.USER) {
            throw new BadRequestException('Only normal users can create payments');
        }

        const turf = await this.turfRepository.findOne({
            where: { id: dto.turfId },
        });

        if (!turf || !turf.isPublished) {
            throw new NotFoundException('Turf not found or not published');
        }

        // Calculate price the same way BookingsService does
        const startHour = parseInt(dto.startTime.split(':')[0]);
        const endHour = parseInt(dto.endTime.split(':')[0]);
        const hours = endHour - startHour;

        if (hours <= 0) {
            throw new BadRequestException('Invalid time slot');
        }

        const totalPrice = Number(turf.pricePerHour) * hours;

        // Create a booking in PENDING state
        const booking = this.bookingRepository.create({
            turfId: turf.id,
            turf,
            userId: user.id,
            user,
            bookingDate: new Date(dto.bookingDate),
            startTime: dto.startTime,
            endTime: dto.endTime,
            totalPrice,
            status: BookingStatus.PENDING,
        });

        const savedBooking = await this.bookingRepository.save(booking);

        const amountInPaise = Math.round(totalPrice * 100);

        const order = await this.razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: savedBooking.id,
            notes: {
                turfId: turf.id,
                userId: user.id,
            },
        });

        const payment = this.paymentRepository.create({
            bookingId: savedBooking.id,
            booking: savedBooking,
            userId: user.id,
            user,
            turfId: turf.id,
            turf,
            ownerId: turf.ownerId,
            amount: totalPrice,
            currency: 'INR',
            provider: 'razorpay',
            status: PaymentStatus.CREATED,
            razorpayOrderId: order.id,
        });

        await this.paymentRepository.save(payment);

        return {
            orderId: order.id,
            amount: amountInPaise,
            currency: 'INR',
            bookingId: savedBooking.id,
            RazorpayKeyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
            customer: {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                contact: user.phone,
            },
        };
    }

    async verifyPayment(dto: VerifyPaymentDto, user: User) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = dto;

        const payment = await this.paymentRepository.findOne({
            where: { razorpayOrderId: razorpay_order_id, bookingId: dto.bookingId },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        // Ensure the booking belongs to this user (or user is admin)
        const booking = await this.bookingRepository.findOne({
            where: { id: payment.bookingId },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        if (booking.userId !== user.id && user.role !== UserRole.ADMIN) {
            throw new BadRequestException('You are not allowed to verify this payment');
        }

        // Verify Razorpay signature
        const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
        if (!keySecret) {
            throw new BadRequestException('Payment configuration missing');
        }
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret as crypto.BinaryLike)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            throw new BadRequestException('Invalid payment signature');
        }

        // Idempotency: if already marked success, just return
        if (payment.status === PaymentStatus.SUCCESS) {
            return { success: true };
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = PaymentStatus.SUCCESS;
        await this.paymentRepository.save(payment);

        // Mark booking as confirmed
        booking.status = BookingStatus.CONFIRMED;
        await this.bookingRepository.save(booking);

        // Credit turf owner's wallet (platform holds funds in Razorpay;
        // owner sees balance here and can be paid out later via payouts).
        const owner = await this.userRepository.findOne({
            where: { id: payment.ownerId },
        });

        if (owner && owner.role === UserRole.TURF_OWNER) {
            const currentBalance = Number(owner.walletBalance || 0);
            owner.walletBalance = currentBalance + Number(payment.amount);
            await this.userRepository.save(owner);
        }

        return { success: true };
    }

    /**
     * Turf owner wallet + payouts summary for dashboard.
     */
    async getOwnerSummary(owner: User) {
        if (owner.role !== UserRole.TURF_OWNER) {
            throw new BadRequestException('Only turf owners have a wallet');
        }

        const payments = await this.paymentRepository.find({
            where: { ownerId: owner.id, status: PaymentStatus.SUCCESS },
            order: { createdAt: 'DESC' },
        });

        const payouts = await this.payoutRepository.find({
            where: { ownerId: owner.id },
            order: { createdAt: 'DESC' },
        });

        const totalEarnings = payments.reduce(
            (sum, p) => sum + Number(p.amount),
            0,
        );
        const totalPayouts = payouts.reduce(
            (sum, p) =>
                p.status === PayoutStatus.COMPLETED || p.status === PayoutStatus.REQUESTED
                    ? sum + Number(p.amount)
                    : sum,
            0,
        );

        return {
            walletBalance: Number(owner.walletBalance || 0),
            totalEarnings,
            totalPayouts,
            payouts: payouts.map((p) => ({
                id: p.id,
                amount: Number(p.amount),
                status: p.status,
                createdAt: p.createdAt,
                processedAt: p.processedAt,
            })),
        };
    }

    /**
     * Turf owner requests payout from their wallet. We immediately deduct from
     * walletBalance and create a payout record in REQUESTED status.
     * Actual bank transfer can be done later via Razorpay Payouts or offline.
     */
    async requestPayout(amount: number, owner: User) {
        if (owner.role !== UserRole.TURF_OWNER) {
            throw new BadRequestException('Only turf owners can request payouts');
        }

        const numericAmount = Number(amount);
        if (!numericAmount || numericAmount <= 0) {
            throw new BadRequestException('Invalid payout amount');
        }

        const currentOwner = await this.userRepository.findOne({
            where: { id: owner.id },
        });
        if (!currentOwner) {
            throw new BadRequestException('Owner not found');
        }
        const currentBalance = Number(currentOwner.walletBalance || 0);

        if (numericAmount > currentBalance) {
            throw new BadRequestException('Insufficient wallet balance');
        }

        const payout = this.payoutRepository.create({
            ownerId: owner.id,
            amount: numericAmount,
            status: PayoutStatus.REQUESTED,
        });
        await this.payoutRepository.save(payout);

        currentOwner.walletBalance = currentBalance - numericAmount;
        await this.userRepository.save(currentOwner);

        return this.getOwnerSummary(currentOwner);
    }

    /**
     * Admin summary of all payments and payouts.
     */
    async getAdminSummary() {
        const payments = await this.paymentRepository.find();
        const payouts = await this.payoutRepository.find();

        const totalVolume = payments.reduce(
            (sum, p) => sum + Number(p.amount),
            0,
        );
        const totalCount = payments.length;
        const successCount = payments.filter(
            (p) => p.status === PaymentStatus.SUCCESS,
        ).length;
        const failedCount = payments.filter(
            (p) => p.status === PaymentStatus.FAILED,
        ).length;

        const requestedPayouts = payouts.filter(
            (p) => p.status === PayoutStatus.REQUESTED,
        );
        const completedPayouts = payouts.filter(
            (p) => p.status === PayoutStatus.COMPLETED,
        );
        const rejectedPayouts = payouts.filter(
            (p) => p.status === PayoutStatus.REJECTED,
        );

        const sumAmount = (items: Payout[]) =>
            items.reduce((sum, p) => sum + Number(p.amount), 0);

        return {
            payments: {
                totalVolume,
                totalCount,
                successCount,
                failedCount,
            },
            payouts: {
                requestedCount: requestedPayouts.length,
                completedCount: completedPayouts.length,
                rejectedCount: rejectedPayouts.length,
                totalRequestedAmount: sumAmount(requestedPayouts),
                totalCompletedAmount: sumAmount(completedPayouts),
                totalRejectedAmount: sumAmount(rejectedPayouts),
            },
        };
    }

    /**
     * Payment history for a normal user.
     */
    async getUserPayments(user: User) {
        if (user.role !== UserRole.USER && user.role !== UserRole.ADMIN) {
            throw new BadRequestException('Only normal users can view this payment history');
        }

        const payments = await this.paymentRepository.find({
            where: { userId: user.id },
            relations: ['booking', 'turf'],
            order: { createdAt: 'DESC' },
        });

        return payments.map((p) => ({
            id: p.id,
            amount: Number(p.amount),
            currency: p.currency,
            status: p.status,
            bookingId: p.bookingId,
            turfName: p.turf?.name,
            bookingDate: p.booking?.bookingDate,
            startTime: p.booking?.startTime,
            endTime: p.booking?.endTime,
            createdAt: p.createdAt,
            razorpayOrderId: p.razorpayOrderId,
            razorpayPaymentId: p.razorpayPaymentId,
        }));
    }

    /**
     * Admin view of payouts, optionally filtered by status.
     */
    async getAdminPayouts(status?: PayoutStatus) {
        const where = status ? { status } : {};
        const payouts = await this.payoutRepository.find({
            where,
            order: { createdAt: 'DESC' },
            relations: ['owner'],
        });

        return payouts.map((p) => ({
            id: p.id,
            amount: Number(p.amount),
            status: p.status,
            createdAt: p.createdAt,
            processedAt: p.processedAt,
            ownerId: p.ownerId,
            ownerName: p.owner
                ? `${p.owner.firstName} ${p.owner.lastName}`
                : undefined,
            ownerEmail: p.owner?.email,
        }));
    }

    /**
     * Admin updates payout status. If rejected, re-credit owner wallet.
     */
    async updatePayoutStatus(
        id: string,
        status: PayoutStatus,
        notes?: string,
    ) {
        const payout = await this.payoutRepository.findOne({
            where: { id },
        });

        if (!payout) {
            throw new NotFoundException('Payout not found');
        }

        // If already completed and re-marked completed, no-op
        if (payout.status === status) {
            return payout;
        }

        const owner = await this.userRepository.findOne({
            where: { id: payout.ownerId },
        });

        if (!owner) {
            throw new BadRequestException('Owner not found for payout');
        }

        // If rejecting a requested payout, re-credit wallet
        if (
            payout.status === PayoutStatus.REQUESTED &&
            status === PayoutStatus.REJECTED
        ) {
            const currentBalance = Number(owner.walletBalance || 0);
            owner.walletBalance = currentBalance + Number(payout.amount);
            await this.userRepository.save(owner);
        }

        // If marking completed from requested, set processedAt
        if (
            payout.status === PayoutStatus.REQUESTED &&
            status === PayoutStatus.COMPLETED
        ) {
            payout.processedAt = new Date();
        }

        payout.status = status;
        payout.notes = notes ?? payout.notes;

        return this.payoutRepository.save(payout);
    }
}


import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Turf } from './turf.entity';
import { Booking } from './booking.entity';

export enum PaymentStatus {
    CREATED = 'created',
    SUCCESS = 'success',
    FAILED = 'failed',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Turf)
    @JoinColumn({ name: 'turfId' })
    turf: Turf;

    @Column()
    turfId: string;

    @ManyToOne(() => Booking)
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

    @Column()
    bookingId: string;

    // Turf owner who will ultimately receive the funds (via wallet/payout)
    @Column()
    ownerId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ default: 'INR' })
    currency: string;

    @Column({ default: 'razorpay' })
    provider: string;

    @Column({
        type: 'simple-enum',
        enum: PaymentStatus,
        default: PaymentStatus.CREATED,
    })
    status: PaymentStatus;

    @Column({ nullable: true })
    razorpayOrderId: string;

    @Column({ nullable: true })
    razorpayPaymentId: string;

    @Column({ nullable: true })
    razorpaySignature: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}


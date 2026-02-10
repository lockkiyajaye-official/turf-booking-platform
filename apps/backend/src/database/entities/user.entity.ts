import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Turf } from './turf.entity';
import { Booking } from './booking.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  TURF_OWNER = 'turf_owner',
}

export enum OnboardingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password?: string | null;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column({ nullable: true })
  emailVerified: boolean;

  @Column({ nullable: true })
  phoneVerified: boolean;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // Turf Owner Approval Status
  @Column({ nullable: true, default: false })
  isApproved: boolean; // Admin approval for turf owners

  @Column({ nullable: true, type: 'text' })
  approvalNotes: string; // Admin notes for approval/rejection

  @Column({
    type: 'simple-enum',
    enum: OnboardingStatus,
    default: OnboardingStatus.PENDING,
  })
  onboardingStatus: OnboardingStatus;

  // Turf Owner specific fields
  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  businessAddress: string;

  @Column({ nullable: true })
  businessPhone: string;

  @Column({ nullable: true, type: 'text' })
  businessDescription: string;

  @Column({ nullable: true })
  taxId: string;

  // User specific fields
  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @OneToMany(() => Turf, (turf) => turf.owner)
  turfs: Turf[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  // For turf owners: accumulated earnings (in INR) that can be paid out.
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  walletBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


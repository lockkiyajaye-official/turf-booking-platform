import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Booking } from './booking.entity';

@Entity('turfs')
export class Turf {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  pincode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerHour: number;

  @Column({ nullable: true })
  surfaceType: string;

  @Column({ nullable: true, default: 0 })
  capacity: number;

  @Column({ type: 'simple-array', default: '' })
  sports: string[];

  @Column({ type: 'simple-array', default: '' })
  amenities: string[];

  @Column({ type: 'simple-array', default: '' })
  images: string[];

  // Index of the primary/cover image in the images array
  @Column({ default: 0 })
  primaryImageIndex: number;

  @Column({ type: 'simple-array', default: '' })
  availableSlots: string[];

  @Column({ type: 'text', nullable: true })
  rules: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ default: false })
  isDraft: boolean;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @ManyToOne(() => User, (user) => user.turfs)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @OneToMany(() => Booking, (booking) => booking.turf)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

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

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerHour: number;

  @Column({ type: 'simple-array', default: '' })
  amenities: string[];

  @Column({ type: 'simple-array', default: '' })
  images: string[];

  @Column({ type: 'simple-array', default: '' })
  availableSlots: string[]; // e.g., ["06:00-07:00", "07:00-08:00", ...]

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublished: boolean; // Only published turfs are visible to users

  @Column({ default: false })
  isDraft: boolean; // Draft turfs are only visible to owner

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

  @Column({ default: 0 })
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

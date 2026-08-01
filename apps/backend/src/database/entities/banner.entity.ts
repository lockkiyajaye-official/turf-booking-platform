import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BannerType {
  PROMOTIONAL = 'promotional',
  ANNOUNCEMENT = 'announcement',
  MAINTENANCE = 'maintenance',
}

export enum BannerTarget {
  ALL = 'all',
  PLAYERS = 'players',
  TURF_OWNERS = 'turf_owners',
}

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  ctaLabel: string;       // e.g. "Book Now"

  @Column({ nullable: true })
  ctaUrl: string;         // e.g. "/turfs"

  @Column({ type: 'enum', enum: BannerType, default: BannerType.ANNOUNCEMENT })
  type: BannerType;

  @Column({ type: 'enum', enum: BannerTarget, default: BannerTarget.ALL })
  target: BannerTarget;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: 0 })
  priority: number;       // higher = shown first

  @Column({ nullable: true, type: 'timestamp' })
  startsAt: Date | null;

  @Column({ nullable: true, type: 'timestamp' })
  endsAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @Column({ type: 'bytea', nullable: true })
  image: Buffer | null;

  @Column({ type: 'varchar', nullable: true })
  imageMimeType: string | null;
}
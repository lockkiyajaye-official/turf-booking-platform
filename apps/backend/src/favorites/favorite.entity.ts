import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Turf } from '../database/entities/turf.entity';

@Entity('favorites')
@Unique(['user', 'turf'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Turf, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'turfId' })
  turf: Turf;

  @CreateDateColumn()
  createdAt: Date;
}

import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../database/entities/user.entity';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 500 })
  subject: string;

  @Column('text')
  message: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';

  @Column({ nullable: true })
  adminResponse: string;

  @Column({ nullable: true })
  respondedAt: Date;

  @Column({ nullable: true })
  respondedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

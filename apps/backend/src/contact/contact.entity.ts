import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

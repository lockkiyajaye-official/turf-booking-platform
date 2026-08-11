import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum DeletionRequestStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
}

@Entity('account_deletion_requests')
export class AccountDeletionRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    email: string;

    @Column({ length: 255, nullable: true })
    userId?: string;

    @Column({ length: 255, nullable: true })
    userName?: string;

    @Column('text', { nullable: true })
    reason?: string;

    @Column({
        type: 'enum',
        enum: DeletionRequestStatus,
        default: DeletionRequestStatus.PENDING,
    })
    status: DeletionRequestStatus;

    @Column('text', { nullable: true })
    adminNotes?: string;

    @Column({ nullable: true })
    processedBy?: string;

    @Column({ nullable: true })
    processedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

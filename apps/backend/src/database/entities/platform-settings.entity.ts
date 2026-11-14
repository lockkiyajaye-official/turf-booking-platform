import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('platform_settings')
export class PlatformSettings {
    @PrimaryColumn({ default: 'default' })
    id: string;

    // Platform charge / commission percentage (e.g. 5.0 for 5%)
    @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.0 })
    platformFeePercent: number;

    // Payment gateway base percentage (e.g. 2.0 for 2% Razorpay fee)
    @Column({ type: 'decimal', precision: 5, scale: 2, default: 2.0 })
    gatewayFeePercent: number;

    // GST percentage applicable on the payment gateway fee (e.g. 18.0 for 18% GST on the 2%)
    @Column({ type: 'decimal', precision: 5, scale: 2, default: 18.0 })
    gatewayGstPercent: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}


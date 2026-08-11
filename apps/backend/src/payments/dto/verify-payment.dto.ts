import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyPaymentDto {
    @IsString()
    @IsOptional()
    razorpay_order_id?: string;

    @IsString()
    @IsOptional()
    razorpay_payment_id?: string;

    @IsString()
    @IsOptional()
    razorpay_signature?: string;

    @IsString()
    @IsNotEmpty()
    bookingId: string;
}


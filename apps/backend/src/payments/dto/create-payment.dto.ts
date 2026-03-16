import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
    @IsString()
    @IsNotEmpty()
    turfId: string;

    @IsDateString()
    bookingDate: string;

    @IsString()
    @IsNotEmpty()
    startTime: string;

    @IsString()
    @IsNotEmpty()
    endTime: string;
}


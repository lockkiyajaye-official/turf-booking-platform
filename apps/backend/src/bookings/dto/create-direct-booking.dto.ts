import {
  IsString,
  IsDateString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateDirectBookingDto {
  @IsUUID()
  turfId: string;

  @IsDateString()
  bookingDate: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customPrice?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string; // 'cash' | 'direct_upi' | 'offline'

  @IsOptional()
  @IsString()
  notes?: string;
}


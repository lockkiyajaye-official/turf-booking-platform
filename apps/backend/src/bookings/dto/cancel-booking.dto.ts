import { IsString, IsOptional } from 'class-validator';

export class CancelBookingDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

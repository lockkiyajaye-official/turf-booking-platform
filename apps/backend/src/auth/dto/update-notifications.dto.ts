import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationsDto {
  @IsOptional()
  @IsBoolean()
  emailBookings?: boolean;

  @IsOptional()
  @IsBoolean()
  emailPayments?: boolean;

  @IsOptional()
  @IsBoolean()
  emailPromos?: boolean;
}

import { IsEmail, IsString, IsPhoneNumber, IsOptional } from 'class-validator';

export class RequestPhoneOtpDto {
  @IsString()
  @IsPhoneNumber()
  phone: string;
}

export class RequestEmailOtpDto {
  @IsEmail()
  email: string;
}

export class VerifyPhoneOtpDto {
  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  otp: string;
}

export class VerifyEmailOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;
}

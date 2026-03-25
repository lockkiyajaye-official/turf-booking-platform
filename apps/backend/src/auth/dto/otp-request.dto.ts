import { IsEmail, IsString, IsPhoneNumber, IsOptional, IsBoolean } from 'class-validator';

export class RequestPhoneOtpDto {
  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsBoolean()
  isLogin?: boolean;
}

export class RequestEmailOtpDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsBoolean()
  isLogin?: boolean;
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

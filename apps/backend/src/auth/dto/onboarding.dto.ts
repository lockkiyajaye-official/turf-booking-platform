import { IsString, IsOptional, IsDateString, IsArray } from 'class-validator';

export class UserOnboardingDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class TurfOwnerOnboardingDto {
  @IsString()
  businessName: string;

  @IsString()
  businessAddress: string;

  @IsString()
  businessPhone: string;

  @IsOptional()
  @IsString()
  businessDescription?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  businessRegistrationDoc?: string;

  @IsOptional()
  @IsString()
  identityDoc?: string;

  @IsOptional()
  verificationDocuments?: any[];
}


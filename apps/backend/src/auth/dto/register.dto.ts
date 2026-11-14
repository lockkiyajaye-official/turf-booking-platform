import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../database/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

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


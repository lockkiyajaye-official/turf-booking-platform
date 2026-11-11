import { IsEmail, IsString, IsPhoneNumber, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../database/entities/user.entity';

export class RegisterWithPhoneOtpDto {
    @IsString()
    @IsPhoneNumber()
    phone: string;

    @IsString()
    otp: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsOptional()
    @IsEmail()
    email?: string;

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

export class RegisterWithEmailOtpDto {
    @IsEmail()
    email: string;

    @IsString()
    otp: string;

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

import { IsEmail, IsString, IsPhoneNumber, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from 'src/database/entities/user.entity';

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

    @IsOptional()
    @IsString()
    @IsPhoneNumber()
    phone?: string;

    @IsEnum(UserRole)
    role: UserRole;
}

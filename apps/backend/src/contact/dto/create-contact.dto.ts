import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  subject: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  message: string;
}

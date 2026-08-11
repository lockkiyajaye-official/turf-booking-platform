import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTurfDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerHour: number;

  @IsOptional()
  @IsString()
  surfaceType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sports?: string[];

  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  primaryImageIndex?: number;

  @IsArray()
  @IsString({ each: true })
  availableSlots: string[];

  @IsOptional()
  @IsString()
  rules?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsString()
  googleMapUrl?: string;

  @IsOptional()
  @IsString()
  mapUrl?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  cancellationPolicyEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  fullRefundHours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  partialRefundHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  partialRefundPercentage?: number;
}

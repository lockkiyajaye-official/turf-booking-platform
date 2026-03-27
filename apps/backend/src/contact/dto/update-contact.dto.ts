import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  adminResponse?: string;

  @IsOptional()
  @IsString()
  respondedBy?: string;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'resolved', 'closed'])
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
}

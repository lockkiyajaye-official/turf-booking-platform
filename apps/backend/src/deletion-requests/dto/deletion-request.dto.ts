import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateDeletionRequestDto {
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    reason?: string;
}

export class UpdateDeletionRequestStatusDto {
    @IsString()
    status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

    @IsOptional()
    @IsString()
    adminNotes?: string;
}

import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateDeletionRequestDto {
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsBoolean()
    confirmDeleteAllData?: boolean;
}

export class UpdateDeletionRequestStatusDto {
    @IsString()
    status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

    @IsOptional()
    @IsString()
    adminNotes?: string;
}

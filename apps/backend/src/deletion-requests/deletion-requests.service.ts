import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AccountDeletionRequest, DeletionRequestStatus } from './deletion-request.entity';
import { CreateDeletionRequestDto, UpdateDeletionRequestStatusDto } from './dto/deletion-request.dto';

@Injectable()
export class DeletionRequestsService {
    constructor(
        @InjectRepository(AccountDeletionRequest)
        private readonly deletionRepo: Repository<AccountDeletionRequest>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly usersService: UsersService,
    ) { }

    async create(createDto: CreateDeletionRequestDto, currentUser?: any): Promise<AccountDeletionRequest> {
        const user = await this.userRepo.findOne({
            where: { email: createDto.email.toLowerCase().trim() },
        });

        const newRequest = this.deletionRepo.create({
            email: createDto.email.toLowerCase().trim(),
            reason: createDto.reason || '',
            confirmDeleteAllData: createDto.confirmDeleteAllData ?? true,
            userId: user ? user.id : currentUser?.id,
            userName: user ? `${user.firstName} ${user.lastName}` : (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : undefined),
            status: DeletionRequestStatus.PENDING,
        });

        return await this.deletionRepo.save(newRequest);
    }

    async findAll(): Promise<AccountDeletionRequest[]> {
        return await this.deletionRepo.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<AccountDeletionRequest> {
        const request = await this.deletionRepo.findOne({ where: { id } });
        if (!request) {
            throw new NotFoundException('Deletion request not found');
        }
        return request;
    }

    async updateStatus(id: string, updateDto: UpdateDeletionRequestStatusDto, adminUser?: any): Promise<AccountDeletionRequest> {
        const request = await this.findOne(id);
        request.status = updateDto.status as DeletionRequestStatus;
        if (updateDto.adminNotes) {
            request.adminNotes = updateDto.adminNotes;
        }
        if (adminUser) {
            request.processedBy = adminUser.email || 'admin';
            request.processedAt = new Date();
        }
        return await this.deletionRepo.save(request);
    }

    async processAndPurge(id: string, adminUser?: any): Promise<{ message: string; request: AccountDeletionRequest }> {
        const request = await this.findOne(id);

        // Find user by email or userId
        let user: User | null = null;
        if (request.userId) {
            user = await this.userRepo.findOne({ where: { id: request.userId } });
        }
        if (!user && request.email) {
            user = await this.userRepo.findOne({ where: { email: request.email.toLowerCase().trim() } });
        }

        if (user) {
            // Delete user account from database
            await this.usersService.deleteUser(user.id);
        }

        request.status = DeletionRequestStatus.COMPLETED;
        request.adminNotes = user
            ? `User ${user.email} (ID: ${user.id}) was permanently deleted from the database.`
            : `Marked completed. No matching user entity found for email ${request.email}.`;
        request.processedBy = adminUser?.email || 'admin';
        request.processedAt = new Date();

        const savedRequest = await this.deletionRepo.save(request);
        return {
            message: 'User account purged and deletion request marked completed',
            request: savedRequest,
        };
    }
}

import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../database/entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findAll(role?: UserRole) {
        const where = role ? { role } : {};
        return this.userRepository.find({
            where,
            relations: ['turfs', 'bookings'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['turfs', 'bookings'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async getTurfOwners() {
        return this.userRepository.find({
            where: { role: UserRole.TURF_OWNER },
            relations: ['turfs'],
            order: { createdAt: 'DESC' },
        });
    }

    async approveTurfOwner(id: string, approvalNotes?: string) {
        const user = await this.findOne(id);

        if (user.role !== UserRole.TURF_OWNER) {
            throw new BadRequestException('User is not a turf owner');
        }

        if (user.isApproved) {
            throw new BadRequestException('Turf owner is already approved');
        }

        user.isApproved = true;
        user.approvalNotes = approvalNotes || '';
        await this.userRepository.save(user);

        return user;
    }

    async rejectTurfOwner(id: string, approvalNotes: string) {
        const user = await this.findOne(id);

        if (user.role !== UserRole.TURF_OWNER) {
            throw new BadRequestException('User is not a turf owner');
        }

        user.isApproved = false;
        user.approvalNotes = approvalNotes || '';
        await this.userRepository.save(user);

        return user;
    }

    async updateUser(id: string, updateData: Partial<User>) {
        const user = await this.findOne(id);
        Object.assign(user, updateData);
        return this.userRepository.save(user);
    }

    async deleteUser(id: string) {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
        return { message: 'User deleted successfully' };
    }

    async getStatistics() {
        const [totalUsers, totalTurfOwners, totalAdmins, pendingApprovals] =
            await Promise.all([
                this.userRepository.count({ where: { role: UserRole.USER } }),
                this.userRepository.count({ where: { role: UserRole.TURF_OWNER } }),
                this.userRepository.count({ where: { role: UserRole.ADMIN } }),
                this.userRepository.count({
                    where: { role: UserRole.TURF_OWNER, isApproved: false },
                }),
            ]);

        return {
            totalUsers,
            totalTurfOwners,
            totalAdmins,
            pendingApprovals,
            approvedTurfOwners: totalTurfOwners - pendingApprovals,
        };
    }
}

import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findAll(role?: UserRole, search?: string, page?: number, limit?: number) {
        const query = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.turfs', 'turfs')
            .leftJoinAndSelect('user.bookings', 'bookings');

        if (role) {
            query.andWhere('user.role = :role', { role });
        }

        if (search && search.trim().length > 0) {
            const term = `%${search.trim().toLowerCase()}%`;
            query.andWhere(
                '(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(user.phone) LIKE :search)',
                { search: term },
            );
        }

        query.orderBy('user.createdAt', 'DESC');

        if (page) {
            const pageNum = page > 0 ? page : 1;
            const limitNum = limit && limit > 0 ? limit : 10;
            const skip = (pageNum - 1) * limitNum;

            const [items, total] = await query.skip(skip).take(limitNum).getManyAndCount();
            const totalPages = Math.ceil(total / limitNum);
            return {
                items,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages,
                hasMore: pageNum < totalPages,
            };
        }

        return query.getMany();
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

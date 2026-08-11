import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from '../database/entities/booking.entity';
import { Turf } from '../database/entities/turf.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreateTurfDto } from './dto/create-turf.dto';
import { UpdateTurfDto } from './dto/update-turf.dto';

@Injectable()
export class TurfsService {
  constructor(
    @InjectRepository(Turf)
    private turfRepository: Repository<Turf>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) { }

  async create(createTurfDto: CreateTurfDto, owner: User) {
    if (owner.role !== UserRole.TURF_OWNER) {
      throw new UnauthorizedException('Only turf owners can create turfs');
    }

    if (!owner.isApproved) {
      throw new UnauthorizedException('Your account needs to be approved by admin before creating turfs');
    }

    const turf = this.turfRepository.create({
      ...createTurfDto,
      owner,
      ownerId: owner.id,
      isDraft: true, // New turfs are created as drafts
      isPublished: false,
    });

    return this.turfRepository.save(turf);
  }

  async findAll(filters?: {
    search?: string;
    sport?: string;
    sports?: string[];
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    includeDrafts?: boolean; // For turf owners to see their drafts
  }, ownerId?: string) {
    const query = this.turfRepository
      .createQueryBuilder('turf')
      .leftJoinAndSelect('turf.owner', 'owner');

    // Only show published turfs to public, or drafts to the owner
    if (ownerId) {
      query.where(
        '(turf.isPublished = :isPublished OR (turf.isDraft = :isDraft AND turf.ownerId = :ownerId))',
        { isPublished: true, isDraft: true, ownerId },
      );
    } else {
      query.where('turf.isPublished = :isPublished', { isPublished: true });
    }

    query.andWhere('turf.isActive = :isActive', { isActive: true });

    if (filters?.search) {
      query.andWhere(
        '(turf.name LIKE :search OR turf.description LIKE :search OR turf.address LIKE :search OR turf.sports LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.sport) {
      query.andWhere(
        '(turf.sports LIKE :sport OR turf.name LIKE :sport OR turf.description LIKE :sport)',
        { sport: `%${filters.sport}%` },
      );
    }

    if (filters?.sports && filters.sports.length > 0) {
      const sportConditions = filters.sports.map((_, i) => `turf.sports LIKE :sport_${i}`).join(' OR ');
      const sportParams = filters.sports.reduce((acc, s, i) => ({ ...acc, [`sport_${i}`]: `%${s}%` }), {});
      query.andWhere(`(${sportConditions})`, sportParams);
    }

    if (filters?.minPrice) {
      query.andWhere('turf.pricePerHour >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters?.maxPrice) {
      query.andWhere('turf.pricePerHour <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const turf = await this.turfRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!turf) {
      throw new NotFoundException('Turf not found');
    }

    return turf;
  }

  async findByOwner(ownerId: string, includeDrafts: boolean = true) {
    const where: any = { ownerId };
    if (!includeDrafts) {
      where.isDraft = false;
    }
    return this.turfRepository.find({
      where,
      relations: ['bookings'],
      order: { createdAt: 'DESC' },
    });
  }

  async publishTurf(id: string, owner: User) {
    const turf = await this.findOne(id);

    if (turf.ownerId !== owner.id && owner.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('You can only publish your own turfs');
    }

    if (!owner.isApproved && owner.role === UserRole.TURF_OWNER) {
      throw new UnauthorizedException('Your account needs to be approved by admin before publishing turfs');
    }

    turf.isPublished = true;
    turf.isDraft = false;
    turf.publishedAt = new Date();
    return this.turfRepository.save(turf);
  }

  async unpublishTurf(id: string, owner: User) {
    const turf = await this.findOne(id);

    if (turf.ownerId !== owner.id && owner.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('You can only un-publish your own turfs');
    }

    turf.isPublished = false;
    turf.isDraft = true;
    return this.turfRepository.save(turf);
  }

  async update(id: string, updateTurfDto: UpdateTurfDto, owner: User) {
    const turf = await this.findOne(id);

    if (turf.ownerId !== owner.id && owner.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('You can only update your own turfs');
    }

    Object.assign(turf, updateTurfDto);
    return this.turfRepository.save(turf);
  }

  async remove(id: string, owner: User) {
    const turf = await this.findOne(id);

    if (turf.ownerId !== owner.id && owner.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('You can only delete your own turfs');
    }

    await this.turfRepository.remove(turf);
    return { message: 'Turf deleted successfully' };
  }

  async getBookedSlots(turfId: string, date: string): Promise<string[]> {
    const targetDate = date ? date.split('T')[0] : '';
    if (!targetDate) return [];

    const activeBookings = await this.bookingRepository.find({
      where: {
        turfId,
        status: In([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
      },
    });

    const bookedSlotsSet = new Set<string>();

    for (const b of activeBookings) {
      const bDate = b.bookingDate instanceof Date
        ? b.bookingDate.toISOString().split('T')[0]
        : String(b.bookingDate).split('T')[0];

      if (bDate === targetDate) {
        if (b.startTime && b.endTime) {
          bookedSlotsSet.add(`${b.startTime}-${b.endTime}`);
          bookedSlotsSet.add(`${b.startTime} - ${b.endTime}`);
        }
        if (b.startTime) {
          bookedSlotsSet.add(b.startTime);
        }
      }
    }

    return Array.from(bookedSlotsSet);
  }

  async checkAvailability(turfId: string, date: string, startTime: string, endTime: string) {
    const turf = await this.findOne(turfId);

    // Check if the slot is in available slots
    const slotString = startTime && endTime ? `${startTime}-${endTime}` : startTime;
    const exists = turf.availableSlots.some((s) => {
      if (s === slotString || s === startTime) return true;
      if (startTime && endTime && (s.includes(startTime) || s.replace(/\s/g, '').includes(slotString.replace(/\s/g, '')))) return true;
      return false;
    });

    if (!exists && turf.availableSlots.length > 0) {
      return { available: false, reason: 'Slot not available' };
    }

    const bookedSlots = await this.getBookedSlots(turfId, date);
    if (bookedSlots.includes(slotString) || (startTime && bookedSlots.includes(startTime))) {
      return { available: false, reason: 'Slot already booked' };
    }

    return { available: true };
  }
}



import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from 'src/database/entities/user.entity';
import { Banner, BannerTarget } from 'src/database/entities/banner.entity'; 

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
  ) {}

  /** Public: returns only active, in-schedule banners for a given user role */
  async getActiveBanners(userRole?: UserRole) {
    const now = new Date();

    const banners = await this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.isActive = true')
      .andWhere('(banner.startsAt IS NULL OR banner.startsAt <= :now)', { now })
      .andWhere('(banner.endsAt IS NULL OR banner.endsAt >= :now)', { now })
      .orderBy('banner.priority', 'DESC')
      .getMany();

    // Filter by target audience
    return banners.filter((b) => {
      if (b.target === BannerTarget.ALL) return true;
      if (b.target === BannerTarget.PLAYERS && userRole === UserRole.USER) return true;
      if (b.target === BannerTarget.TURF_OWNERS && userRole === UserRole.TURF_OWNER) return true;
      return false;
    });
  }

  /** Admin: list all banners */
  async findAll() {
    return this.bannerRepository.find({ order: { priority: 'DESC', createdAt: 'DESC' } });
  }

  /** Find single banner */
  async findOne(id: string) {
    return this.bannerRepository.findOne({ where: { id } });
  }

  /** Admin: create a banner with optional file */
  async create(dto: Partial<Banner>, file?: any) {
    if (file) {
      dto.image = file.buffer;
      dto.imageMimeType = file.mimetype;
    }
    const banner = this.bannerRepository.create(dto);
    return this.bannerRepository.save(banner);
  }

  /** Admin: update a banner with optional file */
  async update(id: string, dto: Partial<Banner>, file?: any) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    if (file) {
      dto.image = file.buffer;
      dto.imageMimeType = file.mimetype;
    }
    Object.assign(banner, dto);
    return this.bannerRepository.save(banner);
  }

  /** Admin: delete a banner */
  async remove(id: string) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    return this.bannerRepository.remove(banner);
  }
}

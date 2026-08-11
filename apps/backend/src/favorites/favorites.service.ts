import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { Turf } from '../database/entities/turf.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Turf)
    private readonly turfRepository: Repository<Turf>,
  ) {}

  async getUserFavorites(userId: string): Promise<Turf[]> {
    const favorites = await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['turf'],
      order: { createdAt: 'DESC' },
    });
    return favorites.map((f) => f.turf);
  }

  async addFavorite(userId: string, turfId: string): Promise<{ success: boolean; message: string }> {
    const turf = await this.turfRepository.findOne({ where: { id: turfId } });
    if (!turf) {
      throw new NotFoundException('Turf not found');
    }

    const existing = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, turf: { id: turfId } },
    });
    if (existing) {
      return { success: true, message: 'Turf already in favorites' };
    }

    const favorite = this.favoriteRepository.create({
      user: { id: userId } as any,
      turf: { id: turfId } as any,
    });
    await this.favoriteRepository.save(favorite);

    return { success: true, message: 'Added to favorites' };
  }

  async removeFavorite(userId: string, turfId: string): Promise<{ success: boolean; message: string }> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, turf: { id: turfId } },
    });
    if (favorite) {
      await this.favoriteRepository.remove(favorite);
    }
    return { success: true, message: 'Removed from favorites' };
  }

  async isFavorite(userId: string, turfId: string): Promise<{ isFavorite: boolean }> {
    const count = await this.favoriteRepository.count({
      where: { user: { id: userId }, turf: { id: turfId } },
    });
    return { isFavorite: count > 0 };
  }
}

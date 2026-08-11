import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@Request() req: any) {
    const turfs = await this.favoritesService.getUserFavorites(req.user.id);
    return { success: true, data: turfs };
  }

  @Get('check/:turfId')
  async checkFavorite(@Request() req: any, @Param('turfId') turfId: string) {
    return this.favoritesService.isFavorite(req.user.id, turfId);
  }

  @Post(':turfId')
  async addFavorite(@Request() req: any, @Param('turfId') turfId: string) {
    return this.favoritesService.addFavorite(req.user.id, turfId);
  }

  @Delete(':turfId')
  async removeFavorite(@Request() req: any, @Param('turfId') turfId: string) {
    return this.favoritesService.removeFavorite(req.user.id, turfId);
  }
}

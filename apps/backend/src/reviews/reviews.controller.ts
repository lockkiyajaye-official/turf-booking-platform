import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':turfId')
  @UseGuards(JwtAuthGuard)
  async submitReview(
    @Param('turfId') turfId: string,
    @Body() dto: CreateReviewDto,
    @Request() req: any,
  ) {
    return this.reviewsService.addOrUpdateReview(req.user.id, turfId, dto);
  }

  @Get(':turfId')
  async getReviews(
    @Param('turfId') turfId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.getTurfReviews(
      turfId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':turfId/my')
  @UseGuards(JwtAuthGuard)
  async getMyReview(@Param('turfId') turfId: string, @Request() req: any) {
    return this.reviewsService.getUserReview(req.user.id, turfId);
  }

  @Delete(':turfId')
  @UseGuards(JwtAuthGuard)
  async deleteReview(@Param('turfId') turfId: string, @Request() req: any) {
    return this.reviewsService.deleteReview(req.user.id, turfId);
  }
}

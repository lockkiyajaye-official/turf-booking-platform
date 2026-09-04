import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { Turf } from '../database/entities/turf.entity';
import { User } from '../database/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Turf)
    private readonly turfRepository: Repository<Turf>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async addOrUpdateReview(
    userId: string,
    turfId: string,
    dto: CreateReviewDto,
  ) {
    const turf = await this.turfRepository.findOne({ where: { id: turfId } });
    if (!turf) {
      throw new NotFoundException('Turf not found');
    }

    let review = await this.reviewRepository.findOne({
      where: { userId, turfId },
    });

    if (review) {
      review.rating = dto.rating;
      if (dto.comment !== undefined) {
        review.comment = dto.comment;
      }
      if (dto.bookingId) {
        review.bookingId = dto.bookingId;
      }
    } else {
      review = new Review();
      review.userId = userId;
      review.turfId = turfId;
      review.rating = dto.rating;
      review.comment = dto.comment ?? null as any;
      review.bookingId = dto.bookingId ?? null as any;
    }

    const savedReview = await this.reviewRepository.save(review);

    // Recalculate turf rating and total reviews
    await this.recalculateTurfRating(turfId);

    const updatedTurf = await this.turfRepository.findOne({
      where: { id: turfId },
    });

    return {
      success: true,
      message: 'Review saved successfully',
      data: {
        id: savedReview.id,
        rating: savedReview.rating,
        comment: savedReview.comment,
        bookingId: savedReview.bookingId,
        createdAt: savedReview.createdAt,
        updatedAt: savedReview.updatedAt,
      },
      summary: {
        rating: updatedTurf ? Number(updatedTurf.rating) : 0,
        totalReviews: updatedTurf ? updatedTurf.totalReviews : 0,
      },
    };
  }

  async getTurfReviews(turfId: string, page = 1, limit = 20) {
    const p = Math.max(1, page);
    const l = Math.max(1, limit);

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { turfId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (p - 1) * l,
      take: l,
    });

    // Calculate rating distribution and average from all reviews
    const allRatings = await this.reviewRepository.find({
      where: { turfId },
      select: ['rating'],
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const r of allRatings) {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
      sum += r.rating;
    }

    const totalReviews = allRatings.length;
    let averageRating =
      totalReviews > 0 ? Math.round((sum / totalReviews) * 10) / 10 : 0;
    let finalTotalReviews = totalReviews;

    if (totalReviews === 0) {
      const turf = await this.turfRepository.findOne({
        where: { id: turfId },
        select: ['rating', 'totalReviews'],
      });
      if (turf) {
        averageRating = Number(turf.rating) || 0;
        finalTotalReviews = Number(turf.totalReviews) || 0;
      }
    }

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      bookingId: r.bookingId,
      createdAt: r.createdAt,
      userId: r.userId,
      userName: r.user
        ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || 'Anonymous'
        : 'Anonymous',
      userAvatar: r.user?.profileImage || null,
    }));

    return {
      success: true,
      data: {
        reviews: formattedReviews,
        total,
        page: p,
        limit: l,
        summary: {
          averageRating,
          totalReviews: finalTotalReviews,
          distribution,
        },
      },
    };
  }

  async getUserReview(userId: string, turfId: string) {
    const review = await this.reviewRepository.findOne({
      where: { userId, turfId },
    });

    return {
      success: true,
      data: review
        ? {
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            bookingId: review.bookingId,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
          }
        : null,
    };
  }

  async deleteReview(userId: string, turfId: string) {
    const review = await this.reviewRepository.findOne({
      where: { userId, turfId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewRepository.remove(review);
    await this.recalculateTurfRating(turfId);

    const updatedTurf = await this.turfRepository.findOne({
      where: { id: turfId },
    });

    return {
      success: true,
      message: 'Review deleted successfully',
      summary: {
        rating: updatedTurf ? Number(updatedTurf.rating) : 0,
        totalReviews: updatedTurf ? updatedTurf.totalReviews : 0,
      },
    };
  }

  private async recalculateTurfRating(turfId: string) {
    const allReviews = await this.reviewRepository.find({
      where: { turfId },
      select: ['rating'],
    });

    const totalReviews = allReviews.length;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating =
      totalReviews > 0 ? Math.round((sum / totalReviews) * 10) / 10 : 0;

    await this.turfRepository.update(turfId, {
      rating: averageRating,
      totalReviews,
    });
  }
}

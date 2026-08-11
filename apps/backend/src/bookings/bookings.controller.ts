import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../database/entities/user.entity';
import { BookingStatus } from '../database/entities/booking.entity';

import { CancelBookingDto } from './dto/cancel-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.TURF_OWNER, UserRole.ADMIN)
  create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(createBookingDto, req.user);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: BookingStatus,
    @Query('search') search?: string,
    @Query('turfId') turfId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any,
  ) {
    return this.bookingsService.findAll(req.user, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      search,
      turfId,
      startDate,
      endDate,
    });
  }

  @Get(':id/cancellation-preview')
  getCancellationPreview(@Param('id') id: string, @Request() req) {
    return this.bookingsService.getCancellationPreview(id, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.bookingsService.findOne(id, req.user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TURF_OWNER, UserRole.USER)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Request() req,
  ) {
    return this.bookingsService.updateStatus(id, status, req.user);
  }

  @Patch(':id/cancel')
  cancelPatch(
    @Param('id') id: string,
    @Body() cancelDto: CancelBookingDto,
    @Request() req,
  ) {
    return this.bookingsService.cancel(id, cancelDto, req.user);
  }

  @Post(':id/cancel')
  cancelPost(
    @Param('id') id: string,
    @Body() cancelDto: CancelBookingDto,
    @Request() req,
  ) {
    return this.bookingsService.cancel(id, cancelDto, req.user);
  }
}


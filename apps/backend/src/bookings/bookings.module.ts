import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from 'src/database/entities/booking.entity';
import { Turf } from 'src/database/entities/turf.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Turf])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule { }


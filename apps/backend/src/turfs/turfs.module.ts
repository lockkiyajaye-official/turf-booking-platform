import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../database/entities/booking.entity';
import { Turf } from '../database/entities/turf.entity';
import { TurfsController } from './turfs.controller';
import { TurfsService } from './turfs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Turf, Booking])],
  controllers: [TurfsController],
  providers: [TurfsService],
  exports: [TurfsService],
})
export class TurfsModule { }



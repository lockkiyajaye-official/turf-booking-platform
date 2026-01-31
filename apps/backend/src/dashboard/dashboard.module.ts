import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Turf } from '../database/entities/turf.entity';
import { Booking } from '../database/entities/booking.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Turf, Booking])],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/database/entities/booking.entity';
import { Turf } from 'src/database/entities/turf.entity';
import { Payment } from 'src/database/entities/payment.entity';
import { Payout } from 'src/database/entities/payout.entity';
import { User } from 'src/database/entities/user.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
    imports: [TypeOrmModule.forFeature([Turf, Booking, Payment, Payout, User])],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }

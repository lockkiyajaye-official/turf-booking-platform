import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Payment } from '../database/entities/payment.entity';
import { Booking } from '../database/entities/booking.entity';
import { Turf } from '../database/entities/turf.entity';
import { User } from '../database/entities/user.entity';
import { Payout } from '../database/entities/payout.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Payment, Booking, Turf, User, Payout]),
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule { }


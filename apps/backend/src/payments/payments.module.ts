import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Payment } from 'src/database/entities/payment.entity';
import { Booking } from 'src/database/entities/booking.entity';
import { Turf } from 'src/database/entities/turf.entity';
import { User } from 'src/database/entities/user.entity';
import { Payout } from 'src/database/entities/payout.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Payment, Booking, Turf, User, Payout]),
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService],
})
export class PaymentsModule { }


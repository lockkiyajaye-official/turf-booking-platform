import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/database/entities/booking.entity';
import { Payment } from 'src/database/entities/payment.entity';
import { Turf } from 'src/database/entities/turf.entity';
import { User } from 'src/database/entities/user.entity';
import { SeedingController } from './seeding.controller';
import { SeedingService } from './seeding.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Turf, Booking, Payment])],
    controllers: [SeedingController],
    providers: [SeedingService],
})
export class SeedingModule { }

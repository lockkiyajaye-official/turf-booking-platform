import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { User } from '../database/entities/user.entity';
import { Turf } from '../database/entities/turf.entity';
import { Booking } from '../database/entities/booking.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Turf, Booking])],
    controllers: [SeedingController],
    providers: [SeedingService],
})
export class SeedingModule { }

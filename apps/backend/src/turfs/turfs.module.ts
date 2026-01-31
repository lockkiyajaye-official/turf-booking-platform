import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurfsService } from './turfs.service';
import { TurfsController } from './turfs.controller';
import { Turf } from '../database/entities/turf.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Turf])],
  controllers: [TurfsController],
  providers: [TurfsService],
  exports: [TurfsService],
})
export class TurfsModule { }


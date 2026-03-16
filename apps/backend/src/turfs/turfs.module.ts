import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turf } from 'src/database/entities/turf.entity';
import { TurfsController } from './turfs.controller';
import { TurfsService } from './turfs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Turf])],
  controllers: [TurfsController],
  providers: [TurfsService],
  exports: [TurfsService],
})
export class TurfsModule { }


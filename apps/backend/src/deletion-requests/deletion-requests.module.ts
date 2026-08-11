import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountDeletionRequest } from './deletion-request.entity';
import { User } from '../database/entities/user.entity';
import { DeletionRequestsController } from './deletion-requests.controller';
import { DeletionRequestsService } from './deletion-requests.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AccountDeletionRequest, User]),
        UsersModule,
    ],
    controllers: [DeletionRequestsController],
    providers: [DeletionRequestsService],
    exports: [DeletionRequestsService],
})
export class DeletionRequestsModule { }

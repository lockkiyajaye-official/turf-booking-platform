import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Request,
    UseGuards
} from '@nestjs/common';
import { DeletionRequestsService } from './deletion-requests.service';
import { CreateDeletionRequestDto, UpdateDeletionRequestStatusDto } from './dto/deletion-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@Controller('deletion-requests')
export class DeletionRequestsController {
    constructor(private readonly deletionService: DeletionRequestsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async submitRequest(
        @Body() createDto: CreateDeletionRequestDto,
        @Request() req: any,
    ) {
        const request = await this.deletionService.create(createDto, req?.user);
        return {
            success: true,
            message: 'Account deletion request submitted successfully. It will be processed within 30 days.',
            data: request,
        };
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getAllRequests() {
        return {
            success: true,
            data: await this.deletionService.findAll(),
        };
    }

    @Get('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getOneRequest(@Param('id') id: string) {
        return {
            success: true,
            data: await this.deletionService.findOne(id),
        };
    }

    @Put('admin/:id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateStatus(
        @Param('id') id: string,
        @Body() updateDto: UpdateDeletionRequestStatusDto,
        @Request() req: any,
    ) {
        return {
            success: true,
            data: await this.deletionService.updateStatus(id, updateDto, req.user),
        };
    }

    @Post('admin/:id/purge')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async purgeUserAccount(
        @Param('id') id: string,
        @Request() req: any,
    ) {
        return await this.deletionService.processAndPurge(id, req.user);
    }
}

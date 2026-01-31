import {
    Controller,
    Get,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BookingStatus } from '../database/entities/booking.entity';
import { UserRole } from '../database/entities/user.entity';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TURF_OWNER)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('statistics')
    getStatistics(@Request() req) {
        return this.dashboardService.getStatistics(req.user.id);
    }

    @Get('bookings')
    getBookings(
        @Request() req,
        @Query('status') status?: BookingStatus,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('turfId') turfId?: string,
    ) {
        return this.dashboardService.getBookings(req.user.id, {
            status,
            startDate,
            endDate,
            turfId,
        });
    }
}

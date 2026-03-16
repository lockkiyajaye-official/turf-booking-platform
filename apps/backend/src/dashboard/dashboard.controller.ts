import {
    Controller,
    Get,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { BookingStatus } from 'src/database/entities/booking.entity';
import { UserRole } from 'src/database/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('statistics')
    @Roles(UserRole.TURF_OWNER)
    getStatistics(@Request() req) {
        return this.dashboardService.getStatistics(req.user.id);
    }

    @Get('bookings')
    @Roles(UserRole.TURF_OWNER)
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

    @Get('admin-overview')
    @Roles(UserRole.ADMIN)
    getAdminOverview() {
        return this.dashboardService.getAdminOverview();
    }
}

import {
    Body,
    Controller,
    Get,
    Patch,
    Param,
    Query,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../database/entities/user.entity';
import { PayoutStatus } from '../database/entities/payout.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('create')
    @UseGuards(RolesGuard)
    @Roles(UserRole.USER, UserRole.TURF_OWNER, UserRole.ADMIN)
    async createOrder(@Body() dto: CreatePaymentDto, @Request() req) {
        return this.paymentsService.createOrder(dto, req.user);
    }

    @Post('verify')
    @UseGuards(RolesGuard)
    @Roles(UserRole.USER, UserRole.TURF_OWNER, UserRole.ADMIN)
    async verify(@Body() dto: VerifyPaymentDto, @Request() req) {
        return this.paymentsService.verifyPayment(dto, req.user);
    }

    @Get('owner/summary')
    @UseGuards(RolesGuard)
    @Roles(UserRole.TURF_OWNER)
    async ownerSummary(@Request() req) {
        return this.paymentsService.getOwnerSummary(req.user);
    }

    @Patch('owner/payout-details')
    @UseGuards(RolesGuard)
    @Roles(UserRole.TURF_OWNER)
    async updatePayoutDetails(
        @Body()
        body: {
            accountHolderName?: string;
            bankName?: string;
            bankAccountNumber?: string;
            ifscCode?: string;
            upiId?: string;
        },
        @Request() req,
    ) {
        return this.paymentsService.updatePayoutDetails(req.user, body);
    }

    @Post('owner/payouts')
    @UseGuards(RolesGuard)
    @Roles(UserRole.TURF_OWNER)
    async requestPayout(@Body('amount') amount: number, @Request() req) {
        return this.paymentsService.requestPayout(amount, req.user);
    }

    @Get('admin/summary')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async adminSummary() {
        return this.paymentsService.getAdminSummary();
    }

    @Get('admin/payouts')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async adminPayouts(
        @Query('status') status?: PayoutStatus,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.paymentsService.getAdminPayouts(
            status,
            page ? parseInt(page, 10) : undefined,
            limit ? parseInt(limit, 10) : undefined,
        );
    }

    @Patch('admin/payouts/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async updatePayout(
        @Param('id') id: string,
        @Body('status') status: PayoutStatus,
        @Body('notes') notes?: string,
    ) {
        return this.paymentsService.updatePayoutStatus(id, status, notes);
    }

    @Get('fee-preview')
    @UseGuards(RolesGuard)
    @Roles(UserRole.USER, UserRole.TURF_OWNER, UserRole.ADMIN)
    async getFeePreview(
        @Query('turfId') turfId: string,
        @Query('hours') hours?: string,
    ) {
        const parsedHours = hours ? Math.max(1, parseFloat(hours)) : 1;
        return this.paymentsService.calculateFeeBreakdown(turfId, parsedHours);
    }

    @Get('admin/settings')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getPlatformSettings() {
        return this.paymentsService.getSettings();
    }

    @Patch('admin/settings')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async updatePlatformSettings(@Body() body: any) {
        return this.paymentsService.updateSettings(body);
    }

    @Get('history')
    @UseGuards(RolesGuard)
    @Roles(UserRole.USER, UserRole.TURF_OWNER, UserRole.ADMIN)
    async history(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Request() req?: any,
    ) {
        return this.paymentsService.getUserPayments(
            req.user,
            page ? parseInt(page, 10) : undefined,
            limit ? parseInt(limit, 10) : undefined,
        );
    }
}


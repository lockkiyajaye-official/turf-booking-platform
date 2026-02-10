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
import { UserRole } from 'src/database/entities/user.entity';
import { PayoutStatus } from 'src/database/entities/payout.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('create')
    @UseGuards(RolesGuard)
    @Roles(UserRole.USER)
    async createOrder(@Body() dto: CreatePaymentDto, @Request() req) {
        return this.paymentsService.createOrder(dto, req.user);
    }

    @Post('verify')
    @UseGuards(RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    async verify(@Body() dto: VerifyPaymentDto, @Request() req) {
        return this.paymentsService.verifyPayment(dto, req.user);
    }

    @Get('owner/summary')
    @UseGuards(RolesGuard)
    @Roles(UserRole.TURF_OWNER)
    async ownerSummary(@Request() req) {
        return this.paymentsService.getOwnerSummary(req.user);
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
    ) {
        return this.paymentsService.getAdminPayouts(status);
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

    @Get('history')
    @UseGuards(RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    async history(@Request() req) {
        return this.paymentsService.getUserPayments(req.user);
    }
}


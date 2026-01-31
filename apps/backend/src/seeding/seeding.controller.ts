import { Controller, Post, UseGuards } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../database/entities/user.entity';

@Controller('seeding')
export class SeedingController {
    constructor(private readonly seedingService: SeedingService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async seed() {
        return this.seedingService.seed();
    }
}

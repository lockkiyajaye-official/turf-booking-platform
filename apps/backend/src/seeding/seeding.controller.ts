import { Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from 'src/database/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SeedingService } from './seeding.service';

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

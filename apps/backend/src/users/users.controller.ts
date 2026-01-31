import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../database/entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll(@Query('role') role?: UserRole) {
        return this.usersService.findAll(role);
    }

    @Get('statistics')
    getStatistics() {
        return this.usersService.getStatistics();
    }

    @Get('turf-owners')
    getTurfOwners() {
        return this.usersService.getTurfOwners();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post('turf-owners/:id/approve')
    approveTurfOwner(
        @Param('id') id: string,
        @Body('approvalNotes') approvalNotes?: string,
    ) {
        return this.usersService.approveTurfOwner(id, approvalNotes);
    }

    @Post('turf-owners/:id/reject')
    rejectTurfOwner(
        @Param('id') id: string,
        @Body('approvalNotes') approvalNotes: string,
    ) {
        return this.usersService.rejectTurfOwner(id, approvalNotes);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateData: Partial<any>) {
        return this.usersService.updateUser(id, updateData);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}

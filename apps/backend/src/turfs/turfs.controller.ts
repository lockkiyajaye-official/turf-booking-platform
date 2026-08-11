import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '../database/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTurfDto } from './dto/create-turf.dto';
import { UpdateTurfDto } from './dto/update-turf.dto';
import { TurfsService } from './turfs.service';

@Controller('turfs')
export class TurfsController {
  constructor(private readonly turfsService: TurfsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TURF_OWNER)
  create(@Body() createTurfDto: CreateTurfDto, @Request() req) {
    return this.turfsService.create(createTurfDto, req.user);
  }

  @Get()
  findAll(@Query() query: any, @Request() req?: any) {
    const filters = {
      search: query.search,
      sport: query.sport,
      sports: query.sports
        ? query.sports.split(',').filter((s: string) => s)
        : undefined,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
      amenities: query.amenities
        ? query.amenities.split(',').filter((a: string) => a)
        : undefined,
      includeDrafts: query.includeDrafts === 'true',
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    };
    // If user is authenticated and is a turf owner, they can see their drafts
    const ownerId = req?.user?.id && req?.user?.role === UserRole.TURF_OWNER ? req.user.id : undefined;
    return this.turfsService.findAll(filters, ownerId);
  }

  @Get('my-turfs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TURF_OWNER)
  findMyTurfs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    return this.turfsService.findByOwner(
      req.user.id,
      true,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get('availability/:id')
  checkAvailability(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.turfsService.checkAvailability(id, date, startTime, endTime);
  }

  @Get(':id/booked-slots')
  getBookedSlots(
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    return this.turfsService.getBookedSlots(id, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.turfsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateTurfDto: UpdateTurfDto,
    @Request() req,
  ) {
    return this.turfsService.update(id, updateTurfDto, req.user);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TURF_OWNER)
  publish(@Param('id') id: string, @Request() req) {
    return this.turfsService.publishTurf(id, req.user);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TURF_OWNER)
  unpublish(@Param('id') id: string, @Request() req) {
    return this.turfsService.unpublishTurf(id, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.turfsService.remove(id, req.user);
  }
}


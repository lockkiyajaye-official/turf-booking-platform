import { Controller, Get, Post, Patch, Delete, Param, Body, Request, UseGuards, ForbiddenException, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from 'src/database/entities/user.entity';
import { BannerService } from './banner.service';

@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get('active')
  getActive(@Request() req) {
    return this.bannerService.getActiveBanners(req.user?.role);
  }

  @Get()
  findAll(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException();
    return this.bannerService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@Request() req, @Body() dto: any, @UploadedFile() file?: Express.Multer.File) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException();
    return this.bannerService.create(dto, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(@Request() req, @Param('id') id: string, @Body() dto: any, @UploadedFile() file?: Express.Multer.File) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException();
    return this.bannerService.update(id, dto, file);
  }

  @Get(':id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const banner = await this.bannerService.findOne(id);
    if (!banner?.image) throw new NotFoundException('No image found');
    res.setHeader('Content-Type', banner.imageMimeType || 'image/jpeg');
    res.send(banner.image);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException();
    return this.bannerService.remove(id);
  }
}
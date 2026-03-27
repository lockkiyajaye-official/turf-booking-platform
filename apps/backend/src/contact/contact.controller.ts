import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Request
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UserRole } from '../database/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  async submitContact(@Body() createContactDto: CreateContactDto) {
    try {
      console.log('Contact form submission:', createContactDto);

      const message = await this.contactService.create(createContactDto);

      // Email notification is automatically sent in the service

      return {
        success: true,
        message: 'Contact form submitted successfully. We will get back to you within 24 hours.',
        data: {
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          submittedAt: message.createdAt
        }
      };
    } catch (error) {
      console.error('Contact form submission error:', error);
      throw new Error('Failed to submit contact form');
    }
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllMessages() {
    return {
      success: true,
      data: await this.contactService.findAll()
    };
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats() {
    return {
      success: true,
      data: await this.contactService.getStats()
    };
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getMessage(@Param('id') id: string) {
    return {
      success: true,
      data: await this.contactService.findOne(id)
    };
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateMessage(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
    @Request() req: any
  ) {
    // Add admin info if responding
    if (updateContactDto.adminResponse) {
      updateContactDto.respondedBy = req.user?.email || 'admin';
    }

    const message = await this.contactService.update(id, updateContactDto);

    // Email response is automatically sent in the service

    return {
      success: true,
      message: 'Message updated successfully',
      data: message
    };
  }

  @Put('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  ) {
    const message = await this.contactService.updateStatus(id, status);

    return {
      success: true,
      message: 'Status updated successfully',
      data: message
    };
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteMessage(@Param('id') id: string) {
    await this.contactService.remove(id);

    return {
      success: true,
      message: 'Message deleted successfully'
    };
  }
}

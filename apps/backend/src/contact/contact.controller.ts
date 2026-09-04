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
  async submitContact(
    @Body() createContactDto: CreateContactDto,
    @Request() req: any,
  ) {
    try {
      console.log('Contact form submission:', createContactDto);

      // Associate userId if passed in body or extracted from auth user
      if (!createContactDto.userId && req.user?.id) {
        createContactDto.userId = req.user.id;
      }

      const message = await this.contactService.create(createContactDto);

      return {
        success: true,
        message: 'Contact form submitted successfully. We will get back to you within 24 hours.',
        data: {
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          status: message.status,
          submittedAt: message.createdAt,
        },
      };
    } catch (error) {
      console.error('Contact form submission error:', error);
      throw error instanceof Error ? error : new Error('Failed to submit contact form');
    }
  }

  @Get('my-tickets')
  @UseGuards(JwtAuthGuard)
  async getMyTickets(@Request() req: any) {
    const userId = req.user?.id;
    const email = req.user?.email;

    const tickets = await this.contactService.findByUser(userId, email);
    return {
      success: true,
      data: tickets,
    };
  }

  @Get('my-tickets/:id')
  @UseGuards(JwtAuthGuard)
  async getMyTicketDetail(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    const email = req.user?.email;

    const ticket = await this.contactService.findUserMessage(id, userId, email);
    return {
      success: true,
      data: ticket,
    };
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

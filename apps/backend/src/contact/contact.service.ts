import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) { }

  async create(createContactDto: CreateContactDto): Promise<ContactMessage> {
    const contactMessage = this.contactRepository.create(createContactDto);
    const savedMessage = await this.contactRepository.save(contactMessage);

    // Send email notification to admin
    await this.emailService.sendContactNotification({
      name: createContactDto.name,
      email: createContactDto.email,
      subject: createContactDto.subject,
      message: createContactDto.message,
    });

    return savedMessage;
  }

  async findAll(): Promise<ContactMessage[]> {
    return await this.contactRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId?: string, email?: string): Promise<ContactMessage[]> {
    const qb = this.contactRepository.createQueryBuilder('message');

    if (userId && email) {
      qb.where('message.userId = :userId OR LOWER(message.email) = LOWER(:email)', {
        userId,
        email,
      });
    } else if (userId) {
      qb.where('message.userId = :userId', { userId });
    } else if (email) {
      qb.where('LOWER(message.email) = LOWER(:email)', { email });
    } else {
      return [];
    }

    return await qb.orderBy('message.createdAt', 'DESC').getMany();
  }

  async findUserMessage(id: string, userId?: string, email?: string): Promise<ContactMessage> {
    const message = await this.findOne(id);
    const matches =
      (userId && message.userId === userId) ||
      (email && message.email.toLowerCase() === email.toLowerCase());

    if (!matches) {
      throw new ForbiddenException('You do not have access to this support ticket');
    }

    return message;
  }

  async findOne(id: string): Promise<ContactMessage> {
    const message = await this.contactRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Contact message not found');
    }
    return message;
  }

  async update(id: string, updateContactDto: UpdateContactDto): Promise<ContactMessage> {
    const message = await this.findOne(id);

    Object.assign(message, updateContactDto);

    if (updateContactDto.adminResponse) {
      message.respondedAt = new Date();
      message.status = 'resolved';

      // Send email response to customer
      await this.emailService.sendAdminResponse({
        customerEmail: message.email,
        customerName: message.name,
        subject: message.subject,
        adminResponse: updateContactDto.adminResponse,
        respondedBy: updateContactDto.respondedBy || 'admin',
      });

      // Send in-app notification if user is known
      if (message.userId) {
        try {
          await this.notificationsService.createNotification(
            message.userId,
            'Support Request Update',
            `An admin responded to your request: "${message.subject}"`,
            NotificationType.SYSTEM,
          );
        } catch (e) {
          console.error('Failed to create in-app notification for contact update:', e);
        }
      }
    }

    return await this.contactRepository.save(message);
  }

  async updateStatus(id: string, status: 'pending' | 'in_progress' | 'resolved' | 'closed'): Promise<ContactMessage> {
    const message = await this.findOne(id);
    message.status = status;
    return await this.contactRepository.save(message);
  }

  async remove(id: string): Promise<void> {
    const message = await this.findOne(id);
    await this.contactRepository.remove(message);
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    closed: number;
  }> {
    const [total, pending, inProgress, resolved, closed] = await Promise.all([
      this.contactRepository.count(),
      this.contactRepository.count({ where: { status: 'pending' } }),
      this.contactRepository.count({ where: { status: 'in_progress' } }),
      this.contactRepository.count({ where: { status: 'resolved' } }),
      this.contactRepository.count({ where: { status: 'closed' } }),
    ]);

    return { total, pending, inProgress, resolved, closed };
  }
}

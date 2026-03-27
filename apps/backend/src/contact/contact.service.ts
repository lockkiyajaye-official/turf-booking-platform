import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
    private readonly emailService: EmailService,
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

  async findOne(id: string): Promise<ContactMessage> {
    const message = await this.contactRepository.findOne({ where: { id } });
    if (!message) {
      throw new Error('Contact message not found');
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

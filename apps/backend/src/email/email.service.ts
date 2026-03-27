import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'Lock Kiya Jaye <noreply@lockkiyajaye.com>';
  }

  /**
   * Send contact form notification to admin
   */
  async sendContactNotification(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    if (!this.isProduction) {
      console.log(`[DEV] Contact form submission:`, contactData);
      return true;
    }

    if (!this.resend) {
      console.error('Resend not configured - missing RESEND_API_KEY');
      return false;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [this.configService.get<string>('ADMIN_EMAIL') || 'admin@lockkiyajaye.com'],
        subject: `New Contact Form Submission: ${contactData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">New Contact Message</h1>
            </div>
            <div style="padding: 20px; background: #f9fafb;">
              <h2 style="color: #16a34a; margin-top: 0;">Contact Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Name:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${contactData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Email:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${contactData.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Subject:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${contactData.subject}</td>
                </tr>
              </table>
              
              <h3 style="color: #16a34a; margin-top: 20px;">Message</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
                <p style="margin: 0; white-space: pre-wrap;">${contactData.message}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${this.configService.get('FRONTEND_URL')}/admin/contact" 
                   style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View in Admin Panel
                </a>
              </div>
            </div>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
              <p>This message was sent from the Lock Kiya Jaye contact form.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send contact notification:', error);
        return false;
      }

      console.log('Contact notification sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error sending contact notification:', error);
      return false;
    }
  }

  /**
   * Send admin response to customer
   */
  async sendAdminResponse(responseData: {
    customerEmail: string;
    customerName: string;
    subject: string;
    adminResponse: string;
    respondedBy: string;
  }): Promise<boolean> {
    if (!this.isProduction) {
      console.log(`[DEV] Admin response to ${responseData.customerEmail}:`, responseData);
      return true;
    }

    if (!this.resend) {
      console.error('Resend not configured - missing RESEND_API_KEY');
      return false;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [responseData.customerEmail],
        subject: `Re: ${responseData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Response from Lock Kiya Jaye</h1>
            </div>
            <div style="padding: 20px; background: #f9fafb;">
              <h2 style="color: #16a34a; margin-top: 0;">Hello ${responseData.customerName},</h2>
              <p>Thank you for contacting us. We've received your message and our team has responded:</p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
                <h3 style="color: #16a34a; margin-top: 0;">Our Response:</h3>
                <p style="margin: 10px 0; white-space: pre-wrap;">${responseData.adminResponse}</p>
              </div>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  <strong>Responded by:</strong> ${responseData.respondedBy}<br>
                  <strong>Original Subject:</strong> ${responseData.subject}
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="margin-bottom: 15px; color: #6b7280;">If you have any further questions, please don't hesitate to contact us.</p>
                <a href="${this.configService.get('FRONTEND_URL')}/contact" 
                   style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Contact Us Again
                </a>
              </div>
            </div>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
              <p>This is an automated response from Lock Kiya Jaye.</p>
              <p>© ${new Date().getFullYear()} Lock Kiya Jaye. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send admin response:', error);
        return false;
      }

      console.log('Admin response sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error sending admin response:', error);
      return false;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Resend } from 'resend';
import { Repository } from 'typeorm';
import { Otp } from '../database/entities/otp.entity';

@Injectable()
export class OtpService {
  private readonly isProduction: boolean;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
  }

  /**
   * Generate a 6-digit OTP
   */
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP in database
   */

  /**
   * Send OTP via SMS (production) or return it directly (development)
   */
  async sendSmsOtp(phone: string, otp: string): Promise<boolean> {
    if (!this.isProduction) {
      // In development, just log the OTP
      console.log(`[DEV] SMS OTP for ${phone}: ${otp}`);
      return true;
    }

    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    // Example with Twilio:
    // const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    // const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //   body: `Your OTP is: ${otp}`,
    //   from: this.configService.get('TWILIO_PHONE_NUMBER'),
    //   to: phone,
    // });

    // For now, return true (implement actual SMS service)
    console.log(`[PROD] SMS OTP for ${phone}: ${otp}`);
    return true;
  }

  /**
   * Send OTP via Email (production) or return it directly (development)
   */
  async sendEmailOtp(email: string, otp: string): Promise<boolean> {
    if (!this.isProduction) {
      // In development, just log the OTP for easier testing
      console.log(`[DEV] Email OTP for ${email}: ${otp}`);
      return true;
    }

    try {
      // Use Resend SDK
      const apiKey = this.configService.get<string>('RESEND_API_KEY');
      const from =
        this.configService.get<string>('EMAIL_FROM') ||
        'Acme <onboarding@resend.dev>';

      if (!apiKey) {
        console.error(
          'Email API key not found in environment variables (RESEND_API_KEY)',
        );
        return false;
      }

      const resend = new Resend(apiKey);

      const { data, error } = await resend.emails.send({
        from,
        to: [email],
        subject: `Your OTP Code: ${otp}`,
        html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                        <h2>Verification Code</h2>
                        <p>Your one-time password (OTP) is:</p>
                        <h1 style="color: #16a34a; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
                        <p>This code will expire in 10 minutes.</p>
                    </div>
                `,
      });

      if (error) {
        console.error('Failed to send OTP email via Resend SDK:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to send OTP email via API', err);
      return false;
    }
  }

  /**
   * Store OTP with expiration (10 minutes)
   */
  async storeOtp(identifier: string, otpCode: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Clean up any existing OTPs to prevent duplicates and race conditions
    await this.otpRepository.delete({ identifier });

    const newOtp = this.otpRepository.create({
      identifier,
      otp: otpCode,
      expiresAt,
      attempts: 0,
    });
    await this.otpRepository.save(newOtp);
  }

  /**
   * Verify OTP
   */
  async verifyOtp(identifier: string, otpCode: string): Promise<boolean> {
    const stored = await this.otpRepository.findOne({
      where: { identifier },
      order: { createdAt: 'DESC' },
    });

    if (!stored) {
      return false;
    }

    if (new Date() > stored.expiresAt) {
      await this.otpRepository.delete(stored.id);
      return false;
    }

    if (stored.attempts >= 5) {
      await this.otpRepository.delete(stored.id);
      return false;
    }

    stored.attempts++;

    if (stored.otp !== otpCode) {
      await this.otpRepository.save(stored);
      return false;
    }

    // OTP verified successfully, remove it
    await this.otpRepository.delete(stored.id);
    return true;
  }

  /**
   * Request OTP for phone
   */
  async requestPhoneOtp(phone: string): Promise<{ expiresIn: number }> {
    const otpCode = this.generateOtp();
    await this.sendSmsOtp(phone, otpCode);
    await this.storeOtp(`phone:${phone}`, otpCode);
    return { expiresIn: 600 }; // 10 minutes
  }

  /**
   * Request OTP for email
   */
  async requestEmailOtp(email: string): Promise<{ expiresIn: number }> {
    const otpCode = this.generateOtp();
    await this.sendEmailOtp(email, otpCode);
    await this.storeOtp(`email:${email}`, otpCode);
    return { expiresIn: 600 }; // 10 minutes
  }

  /**
   * Verify phone OTP
   */
  async verifyPhoneOtp(phone: string, otpCode: string): Promise<boolean> {
    return this.verifyOtp(`phone:${phone}`, otpCode);
  }

  /**
   * Verify email OTP
   */
  async verifyEmailOtp(email: string, otpCode: string): Promise<boolean> {
    return this.verifyOtp(`email:${email}`, otpCode);
  }
}

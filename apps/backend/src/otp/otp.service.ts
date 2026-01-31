import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
    private readonly isProduction: boolean;

    constructor(private configService: ConfigService) {
        this.isProduction = this.configService.get('NODE_ENV') === 'production';
    }

    /**
     * Generate a 6-digit OTP
     */
    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Store OTP in memory (in production, use Redis or database)
     * Format: { identifier: { otp, expiresAt, attempts } }
     */
    private otpStore: Map<
        string,
        { otp: string; expiresAt: Date; attempts: number }
    > = new Map();

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
            // In development, just log the OTP
            console.log(`[DEV] Email OTP for ${email}: ${otp}`);
            return true;
        }

        // In production, integrate with email service (SendGrid, AWS SES, etc.)
        // Example with Nodemailer:
        // const nodemailer = require('nodemailer');
        // const transporter = nodemailer.createTransport({
        //   service: 'gmail',
        //   auth: {
        //     user: this.configService.get('EMAIL_USER'),
        //     pass: this.configService.get('EMAIL_PASS'),
        //   },
        // });
        // await transporter.sendMail({
        //   from: this.configService.get('EMAIL_FROM'),
        //   to: email,
        //   subject: 'Your OTP Code',
        //   text: `Your OTP is: ${otp}`,
        // });

        // For now, return true (implement actual email service)
        console.log(`[PROD] Email OTP for ${email}: ${otp}`);
        return true;
    }

    /**
     * Store OTP with expiration (5 minutes)
     */
    storeOtp(identifier: string, otp: string): void {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        this.otpStore.set(identifier, {
            otp,
            expiresAt,
            attempts: 0,
        });

        // Clean up expired OTPs after 5 minutes
        setTimeout(() => {
            this.otpStore.delete(identifier);
        }, 5 * 60 * 1000);
    }

    /**
     * Verify OTP
     */
    verifyOtp(identifier: string, otp: string): boolean {
        const stored = this.otpStore.get(identifier);

        if (!stored) {
            return false;
        }

        if (new Date() > stored.expiresAt) {
            this.otpStore.delete(identifier);
            return false;
        }

        if (stored.attempts >= 5) {
            this.otpStore.delete(identifier);
            return false;
        }

        stored.attempts++;

        if (stored.otp !== otp) {
            return false;
        }

        // OTP verified successfully, remove it
        this.otpStore.delete(identifier);
        return true;
    }

    /**
     * Request OTP for phone
     */
    async requestPhoneOtp(phone: string): Promise<{ otp?: string; expiresIn: number }> {
        const otp = this.generateOtp();
        await this.sendSmsOtp(phone, otp);
        this.storeOtp(`phone:${phone}`, otp);
        return { otp: this.isProduction ? undefined : otp, expiresIn: 300 }; // 5 minutes
    }

    /**
     * Request OTP for email
     */
    async requestEmailOtp(email: string): Promise<{ otp?: string; expiresIn: number }> {
        const otp = this.generateOtp();
        await this.sendEmailOtp(email, otp);
        this.storeOtp(`email:${email}`, otp);
        return { otp: this.isProduction ? undefined : otp, expiresIn: 300 }; // 5 minutes
    }

    /**
     * Verify phone OTP
     */
    verifyPhoneOtp(phone: string, otp: string): boolean {
        return this.verifyOtp(`phone:${phone}`, otp);
    }

    /**
     * Verify email OTP
     */
    verifyEmailOtp(email: string, otp: string): boolean {
        return this.verifyOtp(`email:${email}`, otp);
    }
}

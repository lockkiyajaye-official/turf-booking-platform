import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Res,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  UserOnboardingDto,
  TurfOwnerOnboardingDto,
} from './dto/onboarding.dto';
import {
  RegisterWithPhoneOtpDto,
  RegisterWithEmailOtpDto,
} from './dto/register-otp.dto';
import {
  RequestPhoneOtpDto,
  RequestEmailOtpDto,
  VerifyPhoneOtpDto,
  VerifyEmailOtpDto,
} from './dto/otp-request.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('admin/login')
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  // OTP endpoints
  @Post('otp/phone/request')
  async requestPhoneOtp(@Body() dto: RequestPhoneOtpDto) {
    return this.authService.requestPhoneOtp(dto);
  }

  @Post('otp/email/request')
  async requestEmailOtp(@Body() dto: RequestEmailOtpDto) {
    return this.authService.requestEmailOtp(dto);
  }

  @Post('register/phone')
  async registerWithPhoneOtp(@Body() dto: RegisterWithPhoneOtpDto) {
    return this.authService.registerWithPhoneOtp(dto);
  }

  @Post('register/email')
  async registerWithEmailOtp(@Body() dto: RegisterWithEmailOtpDto) {
    return this.authService.registerWithEmailOtp(dto);
  }

  @Post('login/phone')
  async loginWithPhoneOtp(@Body() dto: VerifyPhoneOtpDto) {
    return this.authService.loginWithPhoneOtp(dto);
  }

  @Post('login/email')
  async loginWithEmailOtp(@Body() dto: VerifyEmailOtpDto) {
    return this.authService.loginWithEmailOtp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('onboarding/user')
  async completeUserOnboarding(@Request() req, @Body() dto: UserOnboardingDto) {
    return this.authService.completeUserOnboarding(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('onboarding/turf-owner')
  async completeTurfOwnerOnboarding(
    @Request() req,
    @Body() dto: TurfOwnerOnboardingDto,
  ) {
    return this.authService.completeTurfOwnerOnboarding(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const { password, ...user } = req.user;
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('notifications')
  async updateNotifications(@Request() req, @Body() updateData: UpdateNotificationsDto) {
    return this.authService.updateNotifications(req.user.id, updateData);
  }

  // Google OAuth endpoints
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route will redirect the user to Google for authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    // After successful Google authentication, issue our own JWT
    const { token } = await this.authService.loginWithGoogle(req.user);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    const redirectUrl = `${frontendUrl}/google-callback?token=${encodeURIComponent(
      token,
    )}`;

    return res.redirect(redirectUrl);
  }
}

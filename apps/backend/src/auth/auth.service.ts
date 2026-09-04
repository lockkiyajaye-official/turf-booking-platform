import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  OnboardingStatus,
  User,
  UserRole,
} from '../database/entities/user.entity';
import { OtpService } from '../otp/otp.service';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import {
  TurfOwnerOnboardingDto,
  UserOnboardingDto,
} from './dto/onboarding.dto';
import {
  RequestEmailOtpDto,
  RequestPhoneOtpDto,
  VerifyEmailOtpDto,
  VerifyPhoneOtpDto,
} from './dto/otp-request.dto';
import {
  RegisterWithEmailOtpDto,
  RegisterWithPhoneOtpDto,
} from './dto/register-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { ConfigService } from '@nestjs/config';
import { GoogleLoginDto } from './dto/google-login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private otpService: OtpService,
    private configService: ConfigService,
  ) { }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      onboardingStatus: OnboardingStatus.PENDING,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;

    const token = this.jwtService.sign({
      sub: savedUser.id,
      role: savedUser.role,
    });

    return {
      user: result,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // User created via Google OAuth may not have a password
    if (!user.password) {
      throw new UnauthorizedException(
        'Please login with Google for this account',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password as string,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user;
    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    return {
      user: result,
      token,
    };
  }

  async completeUserOnboarding(userId: string, dto: UserOnboardingDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.role !== UserRole.USER) {
      throw new UnauthorizedException('Invalid user');
    }

    Object.assign(user, dto);
    user.onboardingStatus = OnboardingStatus.COMPLETED;

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;

    return result;
  }

  async completeTurfOwnerOnboarding(
    userId: string,
    dto: TurfOwnerOnboardingDto,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Allow users to upgrade their role to Turf Owner during onboarding
    if (user.role === UserRole.USER) {
      user.role = UserRole.TURF_OWNER;
      user.isApproved = false; // Turf owners need admin approval
    } else if (user.role !== UserRole.TURF_OWNER) {
      throw new UnauthorizedException('Invalid user role');
    }

    Object.assign(user, dto);
    user.onboardingStatus = OnboardingStatus.COMPLETED;

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;

    return result;
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  // OTP-based authentication methods
  async requestPhoneOtp(dto: RequestPhoneOtpDto) {
    if (dto.isLogin) {
      const existingUser = await this.userRepository.findOne({
        where: { phone: dto.phone },
      });
      if (!existingUser) {
        throw new UnauthorizedException('User not registered');
      }
    }
    return this.otpService.requestPhoneOtp(dto.phone);
  }

  async requestEmailOtp(dto: RequestEmailOtpDto) {
    if (dto.isLogin) {
      const existingUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (!existingUser) {
        throw new UnauthorizedException('User not registered');
      }
    }
    return this.otpService.requestEmailOtp(dto.email);
  }

  async registerWithPhoneOtp(dto: RegisterWithPhoneOtpDto) {
    // Verify OTP first
    const isValidOtp = await this.otpService.verifyPhoneOtp(dto.phone, dto.otp);
    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if phone already exists
    const existingUser = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (existingUser) {
      throw new ConflictException('Phone number already registered');
    }

    // Check if email is provided and already exists
    if (dto.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already registered');
      }
    }

    // Create user
    const user = this.userRepository.create({
      phone: dto.phone,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      phoneVerified: true,
      emailVerified: dto.email ? false : undefined,
      onboardingStatus: OnboardingStatus.PENDING,
      isApproved: dto.role === UserRole.TURF_OWNER ? false : undefined,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;

    const token = this.jwtService.sign({
      sub: savedUser.id,
      role: savedUser.role,
    });

    return {
      user: result,
      token,
    };
  }

  async registerWithEmailOtp(dto: RegisterWithEmailOtpDto) {
    // Verify OTP first
    const isValidOtp = await this.otpService.verifyEmailOtp(dto.email, dto.otp);
    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if phone is provided and already exists
    if (dto.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Create user
    const user = this.userRepository.create({
      email: dto.email,
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      emailVerified: true,
      phoneVerified: dto.phone ? false : undefined,
      onboardingStatus: OnboardingStatus.PENDING,
      isApproved: dto.role === UserRole.TURF_OWNER ? false : undefined,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;

    const token = this.jwtService.sign({
      sub: savedUser.id,
      role: savedUser.role,
    });

    return {
      user: result,
      token,
    };
  }

  async loginWithPhoneOtp(dto: VerifyPhoneOtpDto) {
    // Verify OTP first
    const isValidOtp = await this.otpService.verifyPhoneOtp(dto.phone, dto.otp);
    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Find user by phone
    const user = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update phone verification status
    user.phoneVerified = true;
    await this.userRepository.save(user);

    const { password, ...result } = user;
    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    return {
      user: result,
      token,
    };
  }

  async loginWithEmailOtp(dto: VerifyEmailOtpDto) {
    // Verify OTP first
    const isValidOtp = await this.otpService.verifyEmailOtp(dto.email, dto.otp);
    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update email verification status
    user.emailVerified = true;
    await this.userRepository.save(user);

    const { password, ...result } = user;
    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    return {
      user: result,
      token,
    };
  }

  // Admin login with email/password (no OTP)
  async adminLogin(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Admin access required');
    }

    // For admin, we still use password (or you can remove password requirement)
    // For now, we'll check if password exists, if not, allow login (for initial setup)
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const { password, ...result } = user;
    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    return {
      user: result,
      token,
    };
  }

  // Google OAuth login/signup
  async loginWithGoogle(googleUser: User) {
    if (!googleUser) {
      throw new UnauthorizedException('Google authentication failed');
    }

    const { password, ...result } = googleUser;
    const token = this.jwtService.sign({
      sub: googleUser.id,
      role: googleUser.role,
    });

    return {
      user: result,
      token,
    };
  }

  // Native/Mobile Google token authentication
  async loginWithGoogleToken(dto: GoogleLoginDto) {
    this.logger.log(
      `[Google Auth] Received token request: serverAuthCode=${dto.serverAuthCode ? 'present' : 'none'}, idToken=${dto.idToken ? 'present' : 'none'}`,
    );

    let email: string | undefined;
    let firstName: string | undefined;
    let lastName: string | undefined;
    let profileImage: string | undefined = undefined;

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    this.logger.log(`[Google Auth] Using backend GOOGLE_CLIENT_ID: ${clientId || 'NOT SET'}`);

    // 1. If serverAuthCode is provided, exchange it for tokens
    if (dto.serverAuthCode) {
      this.logger.log('[Google Auth] Exchanging serverAuthCode with Google OAuth endpoint...');
      try {
        const bodyParams = new URLSearchParams({
          code: dto.serverAuthCode,
          client_id: clientId || '',
          client_secret: clientSecret || '',
          grant_type: 'authorization_code',
          redirect_uri: '',
        });

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: bodyParams.toString(),
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          this.logger.log('[Google Auth] Successfully exchanged serverAuthCode with Google.');
          if (tokenData.id_token) {
            dto.idToken = tokenData.id_token;
            this.logger.log('[Google Auth] Received id_token from code exchange.');
          } else if (tokenData.access_token) {
            this.logger.log('[Google Auth] Fetching userinfo via access_token...');
            const userInfoRes = await fetch(
              'https://www.googleapis.com/oauth2/v3/userinfo',
              { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
            );
            if (userInfoRes.ok) {
              const userInfo = await userInfoRes.json();
              email = userInfo.email;
              firstName = userInfo.given_name || userInfo.name || 'Google';
              lastName = userInfo.family_name || '';
              profileImage = userInfo.picture || undefined;
              this.logger.log(`[Google Auth] Userinfo retrieved for email: ${email}`);
            }
          }
        } else {
          const errText = await tokenResponse.text();
          this.logger.error(`[Google Auth] Token exchange failed HTTP ${tokenResponse.status}: ${errText}`);
        }
      } catch (err) {
        this.logger.error('[Google Auth] Failed to exchange serverAuthCode exception:', err);
      }
    }

    // 2. If we have an idToken, verify it via Google tokeninfo
    if (dto.idToken && !email) {
      this.logger.log('[Google Auth] Verifying idToken with Google tokeninfo endpoint...');
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(dto.idToken)}`,
        );
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          email = payload.email;
          firstName = payload.given_name || payload.name || 'Google';
          lastName = payload.family_name || '';
          profileImage = payload.picture || undefined;
          this.logger.log(`[Google Auth] idToken verified successfully for email: ${email}`);
        } else {
          const errText = await verifyRes.text();
          this.logger.error(`[Google Auth] Tokeninfo verification failed HTTP ${verifyRes.status}: ${errText}`);
        }
      } catch (err) {
        this.logger.error('[Google Auth] Failed to verify idToken exception:', err);
      }
    }

    if (!email) {
      this.logger.warn('[Google Auth] Authentication failed - no email could be verified.');
      throw new UnauthorizedException(
        'Google authentication failed: invalid token or authorization code',
      );
    }

    let user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.log(`[Google Auth] Creating new user for: ${email}`);
      const newUser = this.userRepository.create({
        email,
        firstName: firstName || 'Google',
        lastName: lastName || '',
        password: null as any,
        emailVerified: true,
        phoneVerified: false,
        role: UserRole.USER,
        onboardingStatus: OnboardingStatus.PENDING,
        profileImage,
      });
      user = await this.userRepository.save(newUser);
    } else {
      this.logger.log(`[Google Auth] Existing user found for: ${email} (id: ${user.id})`);
      let changed = false;
      if (!user.emailVerified) {
        user.emailVerified = true;
        changed = true;
      }
      if (!user.profileImage && profileImage) {
        user.profileImage = profileImage;
        changed = true;
      }
      if (changed) {
        user = await this.userRepository.save(user);
      }
    }

    const { password, ...result } = user;
    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    this.logger.log(`[Google Auth] Login successful for user: ${email}, JWT token generated.`);

    return {
      user: result,
      token,
    };
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Reset email verification status when email is updated
      user.emailVerified = false;
    }

    // Check if phone is being updated and if it's already taken
    if (updateData.phone && updateData.phone !== user.phone) {
      const existingUser = await this.userRepository.findOne({
        where: { phone: updateData.phone },
      });

      if (existingUser) {
        throw new ConflictException('Phone number already exists');
      }

      // Reset phone verification status when phone is updated
      user.phoneVerified = false;
    }

    // Update user fields
    Object.assign(user, updateData);

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;

    return result;
  }

  async updateNotifications(userId: string, updateData: UpdateNotificationsDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update notification preferences
    Object.assign(user, updateData);

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;

    return result;
  }
}

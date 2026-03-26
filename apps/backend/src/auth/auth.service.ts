import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  OnboardingStatus,
  User,
  UserRole,
} from 'src/database/entities/user.entity';
import { OtpService } from 'src/otp/otp.service';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private otpService: OtpService,
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

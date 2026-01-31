import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole, OnboardingStatus } from '../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserOnboardingDto, TurfOwnerOnboardingDto } from './dto/onboarding.dto';
import { OtpService } from '../otp/otp.service';
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

    const token = this.jwtService.sign({ sub: savedUser.id, role: savedUser.role });

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

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
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

    if (!user || user.role !== UserRole.TURF_OWNER) {
      throw new UnauthorizedException('Invalid user');
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
    return this.otpService.requestPhoneOtp(dto.phone);
  }

  async requestEmailOtp(dto: RequestEmailOtpDto) {
    return this.otpService.requestEmailOtp(dto.email);
  }

  async registerWithPhoneOtp(dto: RegisterWithPhoneOtpDto) {
    // Verify OTP first
    const isValidOtp = this.otpService.verifyPhoneOtp(dto.phone, dto.otp);
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
    const isValidOtp = this.otpService.verifyEmailOtp(dto.email, dto.otp);
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
    const isValidOtp = this.otpService.verifyPhoneOtp(dto.phone, dto.otp);
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
    const isValidOtp = this.otpService.verifyEmailOtp(dto.email, dto.otp);
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
}


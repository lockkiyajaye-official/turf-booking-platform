import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  User,
  OnboardingStatus,
  UserRole,
} from 'src/database/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      // With global '/api' prefix, the default callback must include '/api'
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  /**
   * Validate is called after Google has authenticated the user.
   * Here we find-or-create a user record and return the user object
   * that will be attached to req.user.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      // Google account without email is not supported
      throw new Error('Google account does not have a public email');
    }

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Create a new basic USER role account for Google sign-in
      const newUser = this.userRepository.create({
        email,
        firstName: profile.name?.givenName || profile.displayName || 'Google',
        lastName: profile.name?.familyName || '',
        // No password for Google accounts
        password: null,
        emailVerified: true,
        phoneVerified: false,
        role: UserRole.USER,
        onboardingStatus: OnboardingStatus.PENDING,
      });

      user = await this.userRepository.save(newUser);
    } else if (!user.emailVerified) {
      user.emailVerified = true;
      await this.userRepository.save(user);
    }

    return user;
  }
}

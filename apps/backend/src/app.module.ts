import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TurfsModule } from './turfs/turfs.module';
import { BookingsModule } from './bookings/bookings.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedingModule } from './seeding/seeding.module';
import { PaymentsModule } from './payments/payments.module';
import { ContactModule } from './contact/contact.module';
import { getDatabaseConfig } from './database/config/database.config';
import { BannerModule } from './banner/banner.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DeletionRequestsModule } from './deletion-requests/deletion-requests.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    TurfsModule,
    BookingsModule,
    UsersModule,
    DashboardModule,
    SeedingModule,
    PaymentsModule,
    ContactModule,
    BannerModule,
    FavoritesModule,
    NotificationsModule,
    DeletionRequestsModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

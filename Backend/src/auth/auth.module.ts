import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshToken } from './entities/refresh-token.entity';
import { PendingRegistration } from './entities/pending-registration.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { TwoFactorChallenge } from './entities/two-factor-challenge.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuardWithPublic } from './guards/public.guard';
import { EmailService } from './email.service';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, PendingRegistration, PasswordReset, TwoFactorChallenge]),
    UsersModule,
    ActivityLogModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    JwtAuthGuardWithPublic,
  ],
  exports: [AuthService, EmailService, JwtAuthGuard, RolesGuard, JwtAuthGuardWithPublic],
})
export class AuthModule {}
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { PendingRegistration } from './entities/pending-registration.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { EmailService } from './email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PendingRegistration)
    private pendingRegistrationRepository: Repository<PendingRegistration>,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private activityLogService: ActivityLogService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findOneByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const tokens = await this.generateTokens(user);
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',
    };
  }

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingPending = await this.pendingRegistrationRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingPending) {
      throw new ConflictException('A verification request for this email is already pending');
    }

    if (!registerDto.agreeTerms) {
      throw new BadRequestException('You must agree to the terms and conditions to create an account.');
    }

    if (registerDto.role === UserRole.ADMIN) {
      const adminSecret = '26D7INNPEV';
      if (registerDto.secretKey !== adminSecret) {
        throw new UnauthorizedException('Invalid admin secret key');
      }
    }

    const verificationCode = this.generateVerificationCode();
    const verificationExpiresAt = new Date(Date.now() + 60 * 1000);
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const { secretKey, ...pendingRegistrationDto } = registerDto as any;

    await this.pendingRegistrationRepository.save(
      this.pendingRegistrationRepository.create({
        ...pendingRegistrationDto,
        password: hashedPassword,
        verificationCode,
        verificationExpiresAt,
      }),
    );

    await this.emailService.sendVerificationCode(registerDto.email, verificationCode);

    return {
      message: 'Verification code has been sent to your email address. Please check your inbox and verify your email to complete registration.',
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    const pending = await this.pendingRegistrationRepository.findOne({
      where: { email: verifyEmailDto.email },
    });

    if (
      !pending ||
      pending.verificationCode !== verifyEmailDto.code ||
      pending.verificationExpiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    await this.usersService.createWithHashedPassword({
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
      password: pending.password,
      role: pending.role,
      school: pending.school,
      level: pending.level,
    });

    await this.pendingRegistrationRepository.delete(pending.id);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationCode(resendVerificationDto: ResendVerificationDto): Promise<{ message: string }> {
    const existingUser = await this.usersService.findOneByEmail(resendVerificationDto.email);
    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const pending = await this.pendingRegistrationRepository.findOne({
      where: { email: resendVerificationDto.email },
    });

    if (!pending) {
      throw new NotFoundException('No pending registration found for this email');
    }

    const verificationCode = this.generateVerificationCode();
    const verificationExpiresAt = new Date(Date.now() + 60 * 1000);

    pending.verificationCode = verificationCode;
    pending.verificationExpiresAt = verificationExpiresAt;
    await this.pendingRegistrationRepository.save(pending);

    await this.emailService.sendVerificationCode(pending.email, verificationCode);

    return { message: 'Verification code resent to your email address' };
  }

  async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const resetCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    const existingReset = await this.passwordResetRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    const resetRecord = existingReset
      ? Object.assign(existingReset, { verificationCode: resetCode, expiresAt })
      : this.passwordResetRepository.create({
          email: forgotPasswordDto.email,
          verificationCode: resetCode,
          expiresAt,
        });

    await this.passwordResetRepository.save(resetRecord);

    try {
      await this.emailService.sendPasswordResetCode(forgotPasswordDto.email, resetCode);
    } catch (error) {
      this.logger.error('Password reset email failed to send', error as Error);
      // Continue silently for security reasons; the endpoint should not reveal whether the email exists.
    }

    return {
      message: 'If the email is registered, a password reset code has been sent to the provided email address.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const resetRecord = await this.passwordResetRepository.findOne({
      where: { email: resetPasswordDto.email },
    });

    if (
      !resetRecord ||
      resetRecord.verificationCode !== resetPasswordDto.code ||
      resetRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    const user = await this.usersService.findOneByEmail(resetPasswordDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.usersService.resetPassword(user.id, resetPasswordDto.newPassword);
    await this.logoutAll(user.id);
    await this.passwordResetRepository.delete(resetRecord.id);

    await this.activityLogService.create({
      action: 'password_reset',
      user_email: updatedUser.email,
      user_name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
      user_role: updatedUser.role,
      resource_title: 'Password reset',
      metadata: JSON.stringify({ method: 'forgot_password', userId: updatedUser.id }),
    });

    return { message: 'Password has been reset successfully' };
  }

  private generateVerificationCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenDto.refreshToken },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.revoked || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { password, ...user } = refreshToken.user;
    const tokens = await this.generateTokens(user);

    // Revoke old refresh token
    refreshToken.revoked = true;
    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (token) {
      token.revoked = true;
      await this.refreshTokenRepository.save(token);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true },
    );
  }

  private async generateTokens(user: Omit<User, 'password'>): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    // Save refresh token to database
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersService.findOne(userId);
    const updatedUser = await this.usersService.update(userId, updateUserDto);

    const nameChanged =
      (updateUserDto.firstName && updateUserDto.firstName !== existingUser.firstName) ||
      (updateUserDto.lastName && updateUserDto.lastName !== existingUser.lastName);

    if (nameChanged) {
      await this.activityLogService.create({
        action: 'user_name_changed',
        user_email: updatedUser.email,
        user_name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
        user_role: updatedUser.role,
        resource_title: 'User name changed',
        metadata: JSON.stringify({
          oldName: `${existingUser.firstName || ''} ${existingUser.lastName || ''}`.trim(),
          newName: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
        }),
      });
    }

    const { password, ...updated } = updatedUser;
    return updated;
  }

  async deleteAccount(user: { id: string; email: string; firstName?: string; lastName?: string; role?: string }): Promise<{ message: string }> {
    await this.logoutAll(user.id);
    await this.usersService.remove(user.id);

    await this.activityLogService.create({
      action: 'account_deleted',
      user_email: user.email,
      user_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      user_role: user.role,
      resource_title: 'User account deleted',
      metadata: JSON.stringify({ deletedBy: user.id, deletionType: 'self' }),
    });

    return { message: 'Account deleted successfully' };
  }

  async sendPasswordUpdateReminders(
    adminUser: Omit<User, 'password'>,
    targetAudience: 'all' | 'students' | 'teachers',
    minAgeDays: number,
    message?: string,
    subject?: string,
  ): Promise<{ message: string; recipients: number }> {
    const users = await this.usersService.findAll();
    const cutoff = new Date(Date.now() - Math.max(0, minAgeDays) * 24 * 60 * 60 * 1000);

    const rolesToInclude =
      targetAudience === 'students'
        ? [UserRole.STUDENT]
        : targetAudience === 'teachers'
        ? [UserRole.TEACHER]
        : [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT];

    const recipients = users.filter((user) => {
      const userDate = user.updatedAt ? new Date(user.updatedAt) : new Date(user.createdAt);
      return rolesToInclude.includes(user.role) && userDate < cutoff;
    });

    await Promise.allSettled(
      recipients.map((recipient) =>
        this.emailService.sendPasswordUpdateReminder(
          recipient.email,
          message || `Hello ${recipient.firstName || 'user'},\n\nThis is a reminder to update your account password if it has not been changed recently. Keeping your password current helps protect your account.`,
          subject,
        ),
      ),
    );

    await this.activityLogService.create({
      action: 'password_update_reminder_sent',
      user_email: adminUser.email,
      user_name: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim(),
      user_role: adminUser.role,
      resource_title: 'Password reminder notification',
      metadata: JSON.stringify({ targetAudience, minAgeDays, recipients: recipients.map((user) => user.email) }),
    });

    return {
      message: `Password update reminder sent to ${recipients.length} user${recipients.length === 1 ? '' : 's'}.`,
      recipients: recipients.length,
    };
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findOne(userId);

    return user as Omit<User, 'password'>;
  }
}
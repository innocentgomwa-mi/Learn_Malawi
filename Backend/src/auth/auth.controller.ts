import { Controller, Post, Body, UseGuards, Get, Request, UsePipes, ValidationPipe, Patch, UseInterceptors, UploadedFile, BadRequestException, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { PasswordReminderDto } from './dto/password-reminder.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from './decorators/public.decorator';
import { UpdateUserDto } from '../users/dto/update-user.dto';

const uploadDir = join(__dirname, '..', '..', 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];

@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Public()
  @Post('resend-verification')
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto): Promise<{ message: string }> {
    return this.authService.resendVerificationCode(resendVerificationDto);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.requestPasswordReset(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(@Request() req): Promise<{ message: string }> {
    await this.authService.logoutAll(req.user.id);
    return { message: 'Logged out from all devices successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, callback) => {
          const ext = file.originalname.substring(file.originalname.lastIndexOf('.')) || '';
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          callback(null, name);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!allowedImageTypes.includes(file.mimetype)) {
          callback(new BadRequestException('Only PNG, JPEG, and WEBP files are allowed for profile images.'), false);
          return;
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async updateProfile(
    @Request() req,
    @UploadedFile() profileImage: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (profileImage) {
      updateUserDto.profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/${profileImage.filename}`;
    }
    return this.authService.updateProfile(req.user.id, updateUserDto);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Request() req): Promise<{ message: string }> {
    return this.authService.deleteAccount(req.user);
  }

  @Post('password-reminders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async sendPasswordReminders(
    @Request() req,
    @Body() passwordReminderDto: PasswordReminderDto,
  ): Promise<{ message: string; recipients: number }> {
    return this.authService.sendPasswordUpdateReminders(
      req.user,
      passwordReminderDto.targetAudience,
      passwordReminderDto.minAgeDays,
      passwordReminderDto.message,
      passwordReminderDto.subject,
    );
  }
}

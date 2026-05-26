import { Controller, Post, Body, UseGuards, Get, Request, UsePipes, ValidationPipe, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(registerDto);
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
}

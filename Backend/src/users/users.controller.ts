import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  private toResponseDto(user: any): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: false,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    const { password, ...userWithoutPassword } = user;
    return this.toResponseDto(userWithoutPassword);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map(user => this.toResponseDto(user));
  }

  @Get('teachers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async findTeachers(): Promise<UserResponseDto[]> {
    const teachers = await this.usersService.findTeachers();
    return teachers.map(user => this.toResponseDto(user));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return this.toResponseDto(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.usersService.findOne(id);
    const user = await this.usersService.update(id, updateUserDto);

    const changedFields: string[] = [];
    if (updateUserDto.firstName && updateUserDto.firstName !== existingUser.firstName) {
      changedFields.push('firstName');
    }
    if (updateUserDto.lastName && updateUserDto.lastName !== existingUser.lastName) {
      changedFields.push('lastName');
    }

    if (changedFields.length > 0) {
      await this.activityLogService.create({
        action: 'user_name_updated',
        user_email: user.email,
        user_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        user_role: user.role,
        resource_title: 'User name updated',
        metadata: JSON.stringify({
          changedFields,
          oldName: `${existingUser.firstName || ''} ${existingUser.lastName || ''}`.trim(),
          newName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          modifiedBy: req.user.id,
          modifiedByRole: req.user.role,
        }),
      });
    }

    const { password, ...userWithoutPassword } = user;
    return this.toResponseDto(userWithoutPassword);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
    const deletedUser = await this.usersService.findOne(id);
    await this.usersService.remove(id);

    await this.activityLogService.create({
      action: 'account_deleted',
      user_email: deletedUser.email,
      user_name: `${deletedUser.firstName || ''} ${deletedUser.lastName || ''}`.trim(),
      user_role: deletedUser.role,
      resource_title: 'User account deleted by admin',
      metadata: JSON.stringify({ deletedBy: req.user.id, deletedByRole: req.user.role, targetUserId: id }),
    });

    return { message: 'User deleted successfully' };
  }
}
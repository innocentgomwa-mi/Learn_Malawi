import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { StudyGroupsService } from './study-groups.service';
import { CreateStudyGroupDto } from './dto/create-study-group.dto';
import { UpdateStudyGroupDto } from './dto/update-study-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('study-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudyGroupsController {
  constructor(private readonly studyGroupsService: StudyGroupsService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  create(@Req() req: any, @Body() createStudyGroupDto: CreateStudyGroupDto) {
    // ensure creator info is set from the authenticated user
    if (req?.user?.email) {
      createStudyGroupDto.creator_email = createStudyGroupDto.creator_email || req.user.email;
      createStudyGroupDto.creator_name = createStudyGroupDto.creator_name || req.user.full_name || req.user.email.split('@')[0];
    }
    return this.studyGroupsService.create(createStudyGroupDto);
  }

  @Get()
  findAll(
    @Query('level') level?: string,
    @Query('subject') subject?: string,
    @Query('mentor_email') mentorEmail?: string,
  ) {
    return this.studyGroupsService.findAll(level, subject, mentorEmail);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studyGroupsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.STUDENT, UserRole.TEACHER)
  update(@Param('id') id: string, @Body() updateStudyGroupDto: UpdateStudyGroupDto) {
    return this.studyGroupsService.update(id, updateStudyGroupDto);
  }

  @Delete(':id')
  @Roles(UserRole.STUDENT, UserRole.TEACHER)
  async remove(@Req() req: any, @Param('id') id: string) {
    const user = req?.user;
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    return this.studyGroupsService.remove(id, user);
  }

  @Delete(':id/members/:memberEmail')
  @Roles(UserRole.TEACHER)
  async removeMember(@Req() req: any, @Param('id') id: string, @Param('memberEmail') memberEmail: string) {
    const user = req?.user;
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    return this.studyGroupsService.removeMember(id, memberEmail, user);
  }
}

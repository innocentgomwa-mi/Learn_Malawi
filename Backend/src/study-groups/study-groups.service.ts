import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyGroup } from './entities/study-group.entity';
import { StudyGroupMessage } from './entities/study-group-message.entity';
import { CreateStudyGroupDto } from './dto/create-study-group.dto';
import { UpdateStudyGroupDto } from './dto/update-study-group.dto';
import { CreateStudyGroupMessageDto } from './dto/create-study-group-message.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class StudyGroupsService {
  constructor(
    @InjectRepository(StudyGroup)
    private readonly studyGroupRepository: Repository<StudyGroup>,
    @InjectRepository(StudyGroupMessage)
    private readonly studyGroupMessageRepository: Repository<StudyGroupMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createStudyGroupDto: CreateStudyGroupDto): Promise<StudyGroup> {
    const studyGroup = this.studyGroupRepository.create(createStudyGroupDto);
    return this.studyGroupRepository.save(studyGroup);
  }

  async findAll(level?: string, subject?: string, mentorEmail?: string): Promise<StudyGroup[]> {
    const query = this.studyGroupRepository.createQueryBuilder('studyGroup');

    if (level && level !== 'All') {
      query.andWhere('studyGroup.level = :level', { level });
    }

    if (subject) {
      query.andWhere('studyGroup.subject ILIKE :subject', { subject: `%${subject}%` });
    }

    if (mentorEmail) {
      query.andWhere('studyGroup.mentor_email = :mentorEmail', { mentorEmail });
    }

    return query.orderBy('studyGroup.createdDate', 'DESC').getMany();
  }

  async findOne(id: string): Promise<StudyGroup> {
    const studyGroup = await this.studyGroupRepository.findOne({ where: { id } });
    if (!studyGroup) {
      throw new NotFoundException(`Study group with ID ${id} not found`);
    }
    return studyGroup;
  }

  async update(id: string, updateStudyGroupDto: UpdateStudyGroupDto): Promise<StudyGroup> {
    const studyGroup = await this.findOne(id);
    Object.assign(studyGroup, updateStudyGroupDto);
    return this.studyGroupRepository.save(studyGroup);
  }

  async remove(id: string, user?: any): Promise<void> {
    const studyGroup = await this.findOne(id);

    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    if (user.role === UserRole.STUDENT) {
      if (!studyGroup.creator_email || studyGroup.creator_email !== user.email) {
        throw new ForbiddenException('You can only delete groups you created.');
      }
      await this.studyGroupRepository.remove(studyGroup);
      return;
    }

    if (user.role === UserRole.TEACHER) {
      const isMember = (studyGroup.members || []).includes(user.email);
      if (!isMember) {
        throw new ForbiddenException('You must join the group before deleting it.');
      }

      const creator = studyGroup.creator_email
        ? await this.userRepository.findOne({ where: { email: studyGroup.creator_email } })
        : null;

      if (!creator || creator.role !== UserRole.STUDENT) {
        throw new ForbiddenException('Teachers can only delete groups created by students.');
      }

      await this.studyGroupRepository.remove(studyGroup);
      return;
    }

    throw new ForbiddenException('You are not allowed to delete this group.');
  }

  async removeMember(groupId: string, memberEmail: string, user?: any): Promise<StudyGroup> {
    const studyGroup = await this.findOne(groupId);

    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    if (user.role === UserRole.TEACHER) {
      const isMember = (studyGroup.members || []).includes(user.email);
      if (!isMember) {
        throw new ForbiddenException('You must join the group before removing members.');
      }

      const creator = studyGroup.creator_email
        ? await this.userRepository.findOne({ where: { email: studyGroup.creator_email } })
        : null;

      if (!creator || creator.role !== UserRole.STUDENT) {
        throw new ForbiddenException('Teachers can only manage members of groups created by students.');
      }

      if (!(studyGroup.members || []).includes(memberEmail)) {
        throw new NotFoundException('Member not found in group');
      }

      studyGroup.members = (studyGroup.members || []).filter((m) => m !== memberEmail);
      return this.studyGroupRepository.save(studyGroup);
    }

    throw new ForbiddenException('You are not allowed to remove members from this group.');
  }

  async createMessage(createStudyGroupMessageDto: CreateStudyGroupMessageDto): Promise<StudyGroupMessage> {
    const studyGroup = await this.findOne(createStudyGroupMessageDto.group_id);
    const authorEmail = createStudyGroupMessageDto.author_email;
    const isMentor = studyGroup.mentor_email === authorEmail;
    const isMember = (studyGroup.members || []).includes(authorEmail);
    const isBanned = (studyGroup.banned_members || []).includes(authorEmail);

    if (!isMentor && (!isMember || isBanned)) {
      throw new ForbiddenException('You are not allowed to send messages in this study group.');
    }

    const message = this.studyGroupMessageRepository.create({
      ...createStudyGroupMessageDto,
      group: studyGroup,
    });
    return this.studyGroupMessageRepository.save(message);
  }

  async findMessages(groupId: string): Promise<StudyGroupMessage[]> {
    return this.studyGroupMessageRepository
      .createQueryBuilder('message')
      .where('message.group_id = :groupId', { groupId })
      .orderBy('message.createdDate', 'ASC')
      .getMany();
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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

  private toEntityPayload(dto: CreateStudyGroupDto | UpdateStudyGroupDto): Partial<StudyGroup> {
    const { icon_url, ...rest } = dto as CreateStudyGroupDto & { icon_url?: string };
    return {
      ...rest,
      ...(icon_url !== undefined ? { iconUrl: icon_url } : {}),
    };
  }

  private displayName(user: User): string {
    return (
      ((user.firstName || '') + (user.lastName ? ` ${user.lastName}` : '')).trim() ||
      user.email.split('@')[0]
    );
  }

  private async resolveMentor(mentorEmail: string): Promise<User> {
    const mentor = await this.userRepository.findOne({ where: { email: mentorEmail } });
    if (!mentor) {
      throw new BadRequestException('Selected mentor was not found.');
    }
    if (mentor.role !== UserRole.TEACHER && mentor.role !== UserRole.ADMIN) {
      throw new BadRequestException('Mentor must be a teacher.');
    }
    return mentor;
  }

  private isMentorTeacher(group: StudyGroup, user?: { email?: string; role?: UserRole }): boolean {
    if (!user?.email) return false;
    const role = user.role;
    return (
      (role === UserRole.TEACHER || role === UserRole.ADMIN) &&
      group.mentor_email === user.email
    );
  }

  private isCreator(
    group: StudyGroup,
    user?: { email?: string; role?: UserRole },
  ): boolean {
    if (!user?.email) return false;
    if (group.creator_email) return group.creator_email === user.email;
    // Legacy groups created before creator_email existed (student stored as mentor)
    return user.role === UserRole.STUDENT && group.mentor_email === user.email;
  }

  async create(createStudyGroupDto: CreateStudyGroupDto, user: { email: string; role: UserRole }): Promise<StudyGroup> {
    if (user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Only students can create study groups.');
    }
    if (!createStudyGroupDto.mentor_email?.trim()) {
      throw new BadRequestException('Please select a teacher mentor.');
    }
    const mentor = await this.resolveMentor(createStudyGroupDto.mentor_email.trim());
    const payload = this.toEntityPayload(createStudyGroupDto);
    payload.creator_email = user.email;
    payload.mentor_email = mentor.email;
    payload.mentor_name = createStudyGroupDto.mentor_name?.trim() || this.displayName(mentor);
    const memberSet = new Set([...(payload.members || []), user.email]);
    payload.members = Array.from(memberSet);
    const studyGroup = this.studyGroupRepository.create(payload);
    return this.studyGroupRepository.save(studyGroup);
  }

  async findAll(level?: string, subject?: string, mentorEmail?: string): Promise<StudyGroup[]> {
    const query = this.studyGroupRepository.createQueryBuilder('studyGroup');
    if (level && level !== 'All') query.andWhere('studyGroup.level = :level', { level });
    if (subject) query.andWhere('studyGroup.subject ILIKE :subject', { subject: `%${subject}%` });
    if (mentorEmail) query.andWhere('studyGroup.mentor_email = :mentorEmail', { mentorEmail });
    const groups = await query.orderBy('studyGroup.createdDate', 'DESC').getMany();

    const allMemberEmails = Array.from(new Set((groups || []).flatMap((g) => g.members || [])));
    if (allMemberEmails.length === 0) return groups;

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email IN (:...emails)', { emails: allMemberEmails })
      .getMany();

    const nameMap = new Map(users.map((u) => [u.email, this.displayName(u)]));

    return groups.map(
      (g) =>
        ({
          ...g,
          members_names: (g.members || []).map((m) => nameMap.get(m) || m),
        }) as StudyGroup,
    );
  }

  async findOne(id: string): Promise<StudyGroup> {
    const studyGroup = await this.studyGroupRepository.findOne({ where: { id } });
    if (!studyGroup) throw new NotFoundException(`Study group with ID ${id} not found`);
    const memberEmails = studyGroup.members || [];
    if (memberEmails.length > 0) {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .where('user.email IN (:...emails)', { emails: memberEmails })
        .getMany();
      const nameMap = new Map(users.map((u) => [u.email, this.displayName(u)]));
      return {
        ...studyGroup,
        members_names: memberEmails.map((m) => nameMap.get(m) || m),
      } as StudyGroup;
    }
    return studyGroup;
  }

  private assertStudentMemberChange(
    group: StudyGroup,
    nextMembers: string[],
    userEmail: string,
  ): void {
    const prev = new Set(group.members || []);
    const next = new Set(nextMembers);
    const added = [...next].filter((e) => !prev.has(e));
    const removed = [...prev].filter((e) => !next.has(e));

    if (added.length === 1 && removed.length === 0 && added[0] === userEmail) {
      if ((group.banned_members || []).includes(userEmail)) {
        throw new ForbiddenException('You have been banned from this group.');
      }
      return;
    }
    if (removed.length === 1 && added.length === 0 && removed[0] === userEmail) {
      return;
    }
    throw new ForbiddenException('You can only join or leave this group yourself.');
  }

  async update(
    id: string,
    updateStudyGroupDto: UpdateStudyGroupDto,
    user?: { email: string; role: UserRole },
  ): Promise<StudyGroup> {
    const studyGroup = await this.findOne(id);
    if (!user) throw new ForbiddenException('Unauthorized');

    const payload = this.toEntityPayload(updateStudyGroupDto);

    if (this.isMentorTeacher(studyGroup, user)) {
      const allowed: Partial<StudyGroup> = {};
      if (payload.members !== undefined) allowed.members = payload.members;
      if (payload.banned_members !== undefined) allowed.banned_members = payload.banned_members;
      Object.assign(studyGroup, allowed);
      return this.studyGroupRepository.save(studyGroup);
    }

    if (user.role === UserRole.STUDENT) {
      const restricted = ['mentor_email', 'mentor_name', 'banned_members', 'creator_email'] as const;
      for (const key of restricted) {
        if ((payload as Record<string, unknown>)[key] !== undefined) {
          throw new ForbiddenException('You cannot change moderation settings for this group.');
        }
      }
      if (payload.members !== undefined) {
        this.assertStudentMemberChange(studyGroup, payload.members, user.email);
        studyGroup.members = payload.members;
      }
      const { members, banned_members, mentor_email, mentor_name, creator_email, ...rest } = payload;
      const detailUpdates = Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== undefined),
      );
      if (Object.keys(detailUpdates).length > 0) {
        if (!this.isCreator(studyGroup, user)) {
          throw new ForbiddenException('Only the group creator can edit group details.');
        }
        Object.assign(studyGroup, detailUpdates);
      }
      return this.studyGroupRepository.save(studyGroup);
    }

    throw new ForbiddenException('You are not allowed to update this study group.');
  }

  async remove(id: string, user?: { email: string; role: UserRole }): Promise<void> {
    const studyGroup = await this.findOne(id);
    if (!user) throw new ForbiddenException('Unauthorized');

    if (user.role === UserRole.STUDENT) {
      if (!this.isCreator(studyGroup, user)) {
        throw new ForbiddenException('You can only delete groups you created.');
      }
      await this.studyGroupRepository.remove(studyGroup);
      return;
    }

    if (user.role === UserRole.TEACHER || user.role === UserRole.ADMIN) {
      if (!this.isMentorTeacher(studyGroup, user)) {
        throw new ForbiddenException('You can only delete groups where you are the assigned mentor.');
      }
      await this.studyGroupRepository.remove(studyGroup);
      return;
    }

    throw new ForbiddenException('You are not allowed to delete this group.');
  }

  async removeMember(
    groupId: string,
    memberEmail: string,
    user?: { email: string; role: UserRole },
    ban = false,
  ): Promise<StudyGroup> {
    const studyGroup = await this.findOne(groupId);
    if (!user) throw new ForbiddenException('Unauthorized');

    if (!this.isMentorTeacher(studyGroup, user)) {
      throw new ForbiddenException('Only the assigned mentor can remove members.');
    }

    const normalizedEmail = decodeURIComponent(memberEmail).toLowerCase();
    const targetEmail = (studyGroup.members || []).find(
      (m) => m.toLowerCase() === normalizedEmail,
    );
    if (!targetEmail) {
      throw new NotFoundException('Member not found in group');
    }
    if (targetEmail === studyGroup.mentor_email) {
      throw new BadRequestException('Cannot remove the mentor from the group.');
    }

    studyGroup.members = (studyGroup.members || []).filter((m) => m !== targetEmail);
    if (ban) {
      studyGroup.banned_members = Array.from(
        new Set([...(studyGroup.banned_members || []), targetEmail]),
      );
    }
    return this.studyGroupRepository.save(studyGroup);
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

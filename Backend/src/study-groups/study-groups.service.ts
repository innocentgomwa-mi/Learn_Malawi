import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyGroup } from './entities/study-group.entity';
import { StudyGroupMessage } from './entities/study-group-message.entity';
import { CreateStudyGroupDto } from './dto/create-study-group.dto';
import { UpdateStudyGroupDto } from './dto/update-study-group.dto';
import { CreateStudyGroupMessageDto } from './dto/create-study-group-message.dto';

@Injectable()
export class StudyGroupsService {
  constructor(
    @InjectRepository(StudyGroup)
    private readonly studyGroupRepository: Repository<StudyGroup>,
    @InjectRepository(StudyGroupMessage)
    private readonly studyGroupMessageRepository: Repository<StudyGroupMessage>,
  ) {}

  async create(createStudyGroupDto: CreateStudyGroupDto): Promise<StudyGroup> {
    const studyGroup = this.studyGroupRepository.create(createStudyGroupDto);
    return this.studyGroupRepository.save(studyGroup);
  }

  async findAll(level?: string, subject?: string): Promise<StudyGroup[]> {
    const query = this.studyGroupRepository.createQueryBuilder('studyGroup');

    if (level && level !== 'All') {
      query.andWhere('studyGroup.level = :level', { level });
    }

    if (subject) {
      query.andWhere('studyGroup.subject ILIKE :subject', { subject: `%${subject}%` });
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

  async remove(id: string): Promise<void> {
    const studyGroup = await this.findOne(id);
    await this.studyGroupRepository.remove(studyGroup);
  }

  async createMessage(createStudyGroupMessageDto: CreateStudyGroupMessageDto): Promise<StudyGroupMessage> {
    const studyGroup = await this.findOne(createStudyGroupMessageDto.group_id);
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

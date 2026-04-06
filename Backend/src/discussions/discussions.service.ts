import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discussion } from './entities/discussion.entity';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class DiscussionsService {
  constructor(
    @InjectRepository(Discussion)
    private readonly discussionsRepository: Repository<Discussion>,
  ) {}

  async create(createDiscussionDto: CreateDiscussionDto) {
    const discussion = this.discussionsRepository.create({
      ...createDiscussionDto,
      comments: createDiscussionDto.comments ?? [],
    });
    return this.discussionsRepository.save(discussion);
  }

  async findAll(teacherEmail?: string) {
    const where = teacherEmail ? { teacherEmail } : {};
    return this.discussionsRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const discussion = await this.discussionsRepository.findOne({ where: { id } });
    if (!discussion) {
      throw new NotFoundException(`Discussion ${id} not found`);
    }
    return discussion;
  }

  async update(id: string, updateDiscussionDto: UpdateDiscussionDto) {
    const discussion = await this.findOne(id);
    Object.assign(discussion, updateDiscussionDto);
    return this.discussionsRepository.save(discussion);
  }

  async remove(id: string) {
    const discussion = await this.findOne(id);
    return this.discussionsRepository.remove(discussion);
  }

  async addComment(id: string, addCommentDto: AddCommentDto) {
    const discussion = await this.findOne(id);
    const comment = {
      author: addCommentDto.author,
      message: addCommentDto.message,
      createdAt: new Date().toISOString(),
    };

    discussion.comments = [...(discussion.comments ?? []), comment];
    return this.discussionsRepository.save(discussion);
  }
}

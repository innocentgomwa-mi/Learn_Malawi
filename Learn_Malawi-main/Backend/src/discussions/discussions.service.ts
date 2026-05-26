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

  create(createDiscussionDto: CreateDiscussionDto): Promise<Discussion> {
    const discussion = this.discussionsRepository.create({
      ...createDiscussionDto,
      comments: createDiscussionDto.comments ?? [],
    });
    return this.discussionsRepository.save(discussion);
  }

  findAll(teacherEmail?: string): Promise<Discussion[]> {
    const query = this.discussionsRepository.createQueryBuilder('discussion');
    if (teacherEmail) {
      query.where('discussion.teacherEmail = :teacherEmail', { teacherEmail });
    }
    return query.orderBy('discussion.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Discussion> {
    const discussion = await this.discussionsRepository.findOne({ where: { id } });
    if (!discussion) throw new NotFoundException(`Discussion #${id} not found`);
    return discussion;
  }

  async update(id: string, updateDiscussionDto: UpdateDiscussionDto): Promise<Discussion> {
    const discussion = await this.findOne(id);
    Object.assign(discussion, updateDiscussionDto);
    return this.discussionsRepository.save(discussion);
  }

  async addComment(id: string, addCommentDto: AddCommentDto): Promise<Discussion> {
    const discussion = await this.findOne(id);
    const newComment = {
      author: addCommentDto.author,
      message: addCommentDto.message,
      createdAt: new Date().toISOString(),
    };
    discussion.comments = [...(discussion.comments ?? []), newComment];
    return this.discussionsRepository.save(discussion);
  }

  async remove(id: string): Promise<void> {
    const discussion = await this.findOne(id);
    await this.discussionsRepository.remove(discussion);
  }
}

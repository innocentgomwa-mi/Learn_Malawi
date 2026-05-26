import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discussion, DiscussionComment } from './entities/discussion.entity';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { EmailService } from '../auth/email.service';

@Injectable()
export class DiscussionsService {
  private readonly logger = new Logger(DiscussionsService.name);

  constructor(
    @InjectRepository(Discussion)
    private readonly discussionsRepository: Repository<Discussion>,
    private readonly emailService: EmailService,
  ) {}

  async create(createDiscussionDto: CreateDiscussionDto) {
    const discussion = this.discussionsRepository.create({
      ...createDiscussionDto,
      comments: createDiscussionDto.comments ?? [],
    });

    const savedDiscussion = await this.discussionsRepository.save(discussion);

    if (savedDiscussion.teacherEmail) {
      await this.notifyTeacherDiscussionByEmail(savedDiscussion);
    }

    return savedDiscussion;
  }

  async findAll(teacherEmail?: string) {
    const where = teacherEmail ? { teacherEmail } : {};
    return this.discussionsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const discussion = await this.discussionsRepository.findOne({
      where: { id },
    });
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
    const comment: DiscussionComment = {
      author: addCommentDto.author,
      message: addCommentDto.message,
      createdAt: new Date().toISOString(),
    };

    const existingComments = discussion.comments ?? [];
    const mergedComments = existingComments.concat(comment);
    discussion.comments = mergedComments;

    const savedDiscussion = await this.discussionsRepository.save(discussion);

    if (savedDiscussion.teacherEmail) {
      await this.notifyTeacherCommentByEmail(savedDiscussion, comment);
    }

    return savedDiscussion;
  }

  private async notifyTeacherDiscussionByEmail(discussion: Discussion) {
    const subject = `New discussion request: ${discussion.title}`;
    const body = `Hello,

A new discussion has been created for you.

Title: ${discussion.title}

${discussion.body}

Open the app to review and reply.`;

    try {
      await this.emailService.sendEmail(discussion.teacherEmail, subject, body);
    } catch (error) {
      this.logger.warn(
        `Unable to deliver discussion email to ${discussion.teacherEmail}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  private async notifyTeacherCommentByEmail(discussion: Discussion, comment: DiscussionComment) {
    const subject = `New comment on discussion: ${discussion.title}`;
    const body = `Hello,

A new comment was added to the discussion "${discussion.title}".

Comment from ${comment.author}:
${comment.message}

Open the app to reply.`;

    try {
      await this.emailService.sendEmail(discussion.teacherEmail, subject, body);
    } catch (error) {
      this.logger.warn(
        `Unable to deliver discussion comment email to ${discussion.teacherEmail}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }
}

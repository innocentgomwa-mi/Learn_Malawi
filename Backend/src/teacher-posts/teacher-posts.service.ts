import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeacherPostDto } from './dto/create-teacher-post.dto';
import { UpdateTeacherPostDto } from './dto/update-teacher-post.dto';
import { TeacherPost } from './entities/teacher-post.entity';

@Injectable()
export class TeacherPostsService {
  constructor(
    @InjectRepository(TeacherPost)
    private readonly teacherPostsRepository: Repository<TeacherPost>,
  ) {}

  create(createTeacherPostDto: CreateTeacherPostDto) {
    const post = this.teacherPostsRepository.create(createTeacherPostDto);
    return this.teacherPostsRepository.save(post);
  }

  async findAll(status?: string) {
    const where = status ? { status } : {};
    return this.teacherPostsRepository.find({ where, order: { createdDate: 'DESC' } });
  }

  async findOne(id: string) {
    const post = await this.teacherPostsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Teacher post not found');
    }
    return post;
  }

  async update(id: string, updateTeacherPostDto: UpdateTeacherPostDto) {
    const post = await this.findOne(id);
    Object.assign(post, updateTeacherPostDto, { updatedDate: new Date() });
    return this.teacherPostsRepository.save(post);
  }

  async remove(id: string) {
    const post = await this.findOne(id);
    await this.teacherPostsRepository.remove(post);
    return { message: 'Teacher post deleted successfully' };
  }
}

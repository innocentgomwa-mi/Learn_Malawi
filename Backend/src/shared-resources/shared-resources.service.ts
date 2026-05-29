import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { SharedResource } from './shared-resource.entity';
import { CreateSharedResourceDto } from './dto/create-shared-resource.dto';
import { UpdateSharedResourceDto } from './dto/update-shared-resource.dto';

@Injectable()
export class SharedResourcesService {
  constructor(
    @InjectRepository(SharedResource)
    private readonly sharedResourceRepository: Repository<SharedResource>,
  ) {}

  async create(createSharedResourceDto: CreateSharedResourceDto, teacherEmail?: string, teacherName?: string): Promise<SharedResource> {
    const resource = this.sharedResourceRepository.create({
      ...createSharedResourceDto,
      teacher_email: teacherEmail,
      teacher_name: teacherName,
    });
    return this.sharedResourceRepository.save(resource);
  }

  async findAll(search?: string, resourceType?: string): Promise<SharedResource[]> {
    const query = this.sharedResourceRepository.createQueryBuilder('resource');

    if (resourceType) {
      query.andWhere('resource.resource_type = :resourceType', { resourceType });
    }

    if (search) {
      query.andWhere(
        '(resource.title ILIKE :search OR resource.description ILIKE :search OR resource.subject ILIKE :search OR resource.class_level ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return query.orderBy('resource.created_date', 'DESC').getMany();
  }

  async findOne(id: string): Promise<SharedResource> {
    const resource = await this.sharedResourceRepository.findOne({ where: { id } });
    if (!resource) {
      throw new NotFoundException(`Shared resource with ID ${id} not found`);
    }
    return resource;
  }

  async update(id: string, updateSharedResourceDto: UpdateSharedResourceDto, userEmail?: string): Promise<SharedResource> {
    const resource = await this.findOne(id);
    if (userEmail && resource.teacher_email !== userEmail) {
      throw new ForbiddenException('You can only edit your own shared resources.');
    }
    Object.assign(resource, updateSharedResourceDto);
    return this.sharedResourceRepository.save(resource);
  }

  async remove(id: string, userEmail?: string): Promise<void> {
    const resource = await this.findOne(id);
    if (userEmail && resource.teacher_email !== userEmail) {
      throw new ForbiddenException('You can only delete your own shared resources.');
    }
    await this.sharedResourceRepository.remove(resource);
  }
}

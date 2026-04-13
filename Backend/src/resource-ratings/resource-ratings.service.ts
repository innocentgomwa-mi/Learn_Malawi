import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateResourceRatingDto } from './dto/create-resource-rating.dto';
import { ResourceRating } from './entities/resource-rating.entity';

@Injectable()
export class ResourceRatingsService {
  constructor(
    @InjectRepository(ResourceRating)
    private readonly resourceRatingsRepository: Repository<ResourceRating>,
  ) {}

  create(createResourceRatingDto: CreateResourceRatingDto) {
    const rating = this.resourceRatingsRepository.create(createResourceRatingDto);
    return this.resourceRatingsRepository.save(rating);
  }

  findAll(resourceId?: string) {
    const where = resourceId ? { resource_id: resourceId } : {};
    return this.resourceRatingsRepository.find({ where, order: { createdDate: 'DESC' } });
  }

  async findOne(id: string) {
    const rating = await this.resourceRatingsRepository.findOne({ where: { id } });
    if (!rating) {
      throw new NotFoundException('Resource rating not found');
    }
    return rating;
  }

  async remove(id: string) {
    const rating = await this.findOne(id);
    await this.resourceRatingsRepository.remove(rating);
    return { message: 'Resource rating deleted successfully' };
  }
}

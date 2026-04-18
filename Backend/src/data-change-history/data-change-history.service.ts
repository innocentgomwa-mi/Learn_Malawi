import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDataChangeHistoryDto } from './dto/create-data-change-history.dto';
import { DataChangeHistory } from './entities/data-change-history.entity';

@Injectable()
export class DataChangeHistoryService {
  constructor(
    @InjectRepository(DataChangeHistory)
    private readonly dataChangeHistoryRepository: Repository<DataChangeHistory>,
  ) {}

  create(createDataChangeHistoryDto: CreateDataChangeHistoryDto) {
    const entry = this.dataChangeHistoryRepository.create(createDataChangeHistoryDto);
    return this.dataChangeHistoryRepository.save(entry);
  }

  findAll(limit?: number) {
    return this.dataChangeHistoryRepository.find({
      order: { createdDate: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: string) {
    const entry = await this.dataChangeHistoryRepository.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Data change history entry not found');
    }
    return entry;
  }
}

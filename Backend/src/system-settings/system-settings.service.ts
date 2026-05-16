import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { SystemSetting } from './entities/system-setting.entity';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly systemSettingsRepository: Repository<SystemSetting>,
  ) {}

  create(createSystemSettingDto: CreateSystemSettingDto) {
    const setting = this.systemSettingsRepository.create(createSystemSettingDto);
    return this.systemSettingsRepository.save(setting);
  }

  findAll() {
    return this.systemSettingsRepository.find({ order: { key: 'ASC' } });
  }

  async findOne(id: string) {
    const setting = await this.systemSettingsRepository.findOne({ where: { id } });
    if (!setting) {
      throw new NotFoundException('System setting not found');
    }
    return setting;
  }

  async update(id: string, updateSystemSettingDto: UpdateSystemSettingDto) {
    const setting = await this.findOne(id);
    Object.assign(setting, updateSystemSettingDto);
    return this.systemSettingsRepository.save(setting);
  }
}

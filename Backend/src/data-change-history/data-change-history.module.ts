import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataChangeHistoryController } from './data-change-history.controller';
import { DataChangeHistoryService } from './data-change-history.service';
import { DataChangeHistory } from './entities/data-change-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataChangeHistory])],
  controllers: [DataChangeHistoryController],
  providers: [DataChangeHistoryService],
  exports: [DataChangeHistoryService],
})
export class DataChangeHistoryModule {}

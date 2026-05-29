import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchLogController } from './search-log.controller';
import { SearchLogService } from './search-log.service';
import { SearchLog } from './entities/search-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchLog])],
  controllers: [SearchLogController],
  providers: [SearchLogService],
  exports: [SearchLogService],
})
export class SearchLogModule {}

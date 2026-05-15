import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PastPapersService } from './past-papers.service';
import { PastPapersController } from './past-papers.controller';
import { PastPaper } from './entities/past-paper.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([PastPaper]), AiModule],
  controllers: [PastPapersController],
  providers: [PastPapersService],
  exports: [PastPapersService],
})
export class PastPapersModule {}

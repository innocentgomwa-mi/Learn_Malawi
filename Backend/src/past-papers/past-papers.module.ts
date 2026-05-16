import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PastPapersService } from './past-papers.service';
import { PastPapersController } from './past-papers.controller';
import { PastPaper } from './entities/past-paper.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PastPaper])],
  controllers: [PastPapersController],
  providers: [PastPapersService],
  exports: [PastPapersService],
})
export class PastPapersModule {}

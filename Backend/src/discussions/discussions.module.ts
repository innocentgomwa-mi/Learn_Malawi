import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscussionsService } from './discussions.service';
import { DiscussionsController } from './discussions.controller';
import { Discussion } from './entities/discussion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discussion])],
  controllers: [DiscussionsController],
  providers: [DiscussionsService],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}

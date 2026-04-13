import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceRatingsController } from './resource-ratings.controller';
import { ResourceRatingsService } from './resource-ratings.service';
import { ResourceRating } from './entities/resource-rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceRating])],
  controllers: [ResourceRatingsController],
  providers: [ResourceRatingsService],
  exports: [ResourceRatingsService],
})
export class ResourceRatingsModule {}

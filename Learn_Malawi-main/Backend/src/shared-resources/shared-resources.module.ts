import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedResourcesController } from './shared-resources.controller';
import { SharedResourcesService } from './shared-resources.service';
import { SharedResource } from './shared-resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SharedResource])],
  controllers: [SharedResourcesController],
  providers: [SharedResourcesService],
  exports: [SharedResourcesService],
})
export class SharedResourcesModule {}

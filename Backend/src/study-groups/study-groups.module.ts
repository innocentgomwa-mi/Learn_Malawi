import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyGroupsController } from './study-groups.controller';
import { StudyGroupMessagesController } from './study-group-messages.controller';
import { StudyGroupsService } from './study-groups.service';
import { StudyGroup } from './entities/study-group.entity';
import { StudyGroupMessage } from './entities/study-group-message.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudyGroup, StudyGroupMessage, User])],
  controllers: [StudyGroupsController, StudyGroupMessagesController],
  providers: [StudyGroupsService],
  exports: [StudyGroupsService],
})
export class StudyGroupsModule {}

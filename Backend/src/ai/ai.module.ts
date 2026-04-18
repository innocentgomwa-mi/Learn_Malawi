import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService],
<<<<<<< HEAD
  exports: [AiService],
=======
>>>>>>> 4174fba (changes to admin dashboard)
})
export class AiModule {}

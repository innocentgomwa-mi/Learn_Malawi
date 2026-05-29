import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { EmbeddingService } from './embedding.service';
import { PdfExtractorService } from './pdf-extractor.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, EmbeddingService, PdfExtractorService],
  exports: [AiService, EmbeddingService, PdfExtractorService],
})
export class AiModule {}

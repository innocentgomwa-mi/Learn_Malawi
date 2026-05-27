import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class EmbeddingService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let i = 0;
    while (i < words.length) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim().length > 50) chunks.push(chunk.trim());
      i += chunkSize - overlap;
    }
    return chunks;
  }

  async embedAndStore(params: {
    sourceId: string;
    sourceType: 'past_paper' | 'study_note';
    subject: string;
    level: string;
    year?: number;
    text: string;
  }): Promise<void> {
    const chunks = this.chunkText(params.text);
    await this.dataSource.query(
      `DELETE FROM paper_embeddings WHERE past_paper_id = $1`,
      [params.sourceId],
    );
    for (let i = 0; i < chunks.length; i++) {
      await this.dataSource.query(
        `INSERT INTO paper_embeddings
         (past_paper_id, subject, level, year, chunk_index, chunk_text)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [params.sourceId, params.subject, params.level, params.year || 0, i, chunks[i]],
      );
    }
    console.log(`RAG: Stored ${chunks.length} chunks from ${params.sourceType} "${params.sourceId}"`);
  }

  async searchRelevantChunks(params: {
    topic: string;
    subject?: string;
    level?: string;
    limit?: number;
  }): Promise<string[]> {
    const { topic, subject, level, limit = 5 } = params;
    let query = `
      SELECT chunk_text,
             ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank
      FROM paper_embeddings
      WHERE search_vector @@ plainto_tsquery('english', $1)
    `;
    const queryParams: any[] = [topic];
    let paramCount = 2;
    if (subject) { query += ` AND LOWER(subject) = LOWER($${paramCount})`; queryParams.push(subject); paramCount++; }
    if (level) { query += ` AND LOWER(level) = LOWER($${paramCount})`; queryParams.push(level); paramCount++; }
    query += ` ORDER BY rank DESC LIMIT $${paramCount}`;
    queryParams.push(limit);
    try {
      const results = await this.dataSource.query(query, queryParams);
      return results.map((r: any) => r.chunk_text);
    } catch { return []; }
  }
}

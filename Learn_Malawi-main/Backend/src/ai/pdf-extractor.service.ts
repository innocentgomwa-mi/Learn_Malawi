import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class PdfExtractorService {

  async extractTextFromPath(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    return this.extractTextFromBuffer(buffer);
  }

  async extractTextFromUrl(url: string): Promise<string> {
    const buffer = await this.downloadFile(url);
    return this.extractTextFromBuffer(buffer);
  }

  private async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str || '')
        .join(' ');
      textParts.push(pageText);
    }

    return textParts.join('\n');
  }

  private downloadFile(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      protocol.get(url, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    });
  }
}

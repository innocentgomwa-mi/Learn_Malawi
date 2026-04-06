import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface HuggingFaceObject {
  generated_text?: unknown;
}

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('HF_API_KEY') ?? '';
    this.model =
      this.configService.get<string>('HF_MODEL') ?? 'google/flan-t5-small';
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'Hugging Face API key is not configured.',
      );
    }

    const response = await fetch(
      `https://api.router.huggingface.co/models/${this.model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          options: {
            wait_for_model: true,
          },
        }),
      },
    );

    const responseBody = await response.text();

    if (!response.ok) {
      throw new InternalServerErrorException(
        `Hugging Face request failed: ${response.status} ${responseBody}`,
      );
    }

    const parsedText = this.parseResponse(responseBody);
    return parsedText ?? responseBody.trim();
  }

  private parseResponse(body: string): string | null {
    try {
      const parsed = JSON.parse(body) as unknown;

      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        isHuggingFaceObject(parsed[0])
      ) {
        const text = parsed[0].generated_text;
        return typeof text === 'string' ? text.trim() : null;
      }

      if (isHuggingFaceObject(parsed)) {
        const text = parsed.generated_text;
        return typeof text === 'string' ? text.trim() : null;
      }
    } catch {
      return null;
    }

    return null;
  }
}

function isHuggingFaceObject(value: unknown): value is HuggingFaceObject {
  return (
    typeof value === 'object' && value !== null && 'generated_text' in value
  );
}

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

  async generateQuiz(note: {
    title: string;
    subject: string;
    level: string;
    topic?: string;
    content?: string;
    summary?: string;
  }): Promise<Array<{ question: string; options: string[]; correct_answer: string; explanation: string }>> {
    const prompt = `You are an educational assistant for Malawian students. Based on the following study note, generate exactly 5 multiple-choice questions to test the student's understanding. Return only valid JSON with a top-level object containing a \"questions\" array. Each question must have exactly 4 options and one correct_answer. Include a short explanation for each question.\n\nStudy Note Title: ${note.title}\nSubject: ${note.subject}\nLevel: ${note.level}\nTopic: ${note.topic || 'General'}\nContent: ${note.content || note.summary || ''}`;
    try {
      const responseText = await this.generateResponse(prompt);
      return this.parseQuizResponse(responseText);
    } catch {
      return this.generateFallbackQuiz(note);
    }
  }

  private generateFallbackQuiz(note: {
    title: string;
    subject: string;
    level: string;
    topic?: string;
    content?: string;
    summary?: string;
  }) {
    const sourceText = note.summary || note.content || note.title || '';
    const snippet = sourceText.length > 100 ? `${sourceText.slice(0, 97).trim()}...` : sourceText;

    return [
      {
        question: 'What is the main subject of this study note?',
        options: [
          note.subject,
          'History',
          'Science',
          'English',
        ],
        correct_answer: note.subject,
        explanation: `This note is classified under ${note.subject}.`,
      },
      {
        question: 'Which level is this study note intended for?',
        options: [
          note.level,
          'Form 1',
          'Form 2',
          'Form 3',
        ],
        correct_answer: note.level,
        explanation: `The note is labelled for ${note.level}.`,
      },
      {
        question: 'Which title matches this study note?',
        options: [
          note.title,
          'Introductory Study Guide',
          'Exam Preparation Notes',
          'Classroom Practice Summary',
        ],
        correct_answer: note.title,
        explanation: 'The correct title is the one provided with the note.',
      },
      {
        question: 'What does this note primarily cover?',
        options: [
          snippet || 'Key ideas from the note',
          'A list of unrelated topics',
          'A discussion about holidays',
          'A fictional story summary',
        ],
        correct_answer: snippet || 'Key ideas from the note',
        explanation: 'The note content or summary best matches this answer.',
      },
      {
        question: 'This study note is most useful for what?',
        options: [
          'Reviewing the main concepts',
          'Cooking a recipe',
          'Playing a sport',
          'Learning a musical instrument',
        ],
        correct_answer: 'Reviewing the main concepts',
        explanation: 'Study notes are intended for reviewing and reinforcing learning.',
      },
    ];
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

  private parseQuizResponse(body: string) {
    const jsonText = this.extractJson(body);
    if (!jsonText) {
      throw new InternalServerErrorException('Could not parse quiz response from AI.');
    }

    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed?.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Missing questions array');
      }
      return parsed.questions.map((question) => ({
        question: String(question.question || ''),
        options: Array.isArray(question.options) ? question.options.map(String) : [],
        correct_answer: String(question.correct_answer || ''),
        explanation: String(question.explanation || ''),
      }));
    } catch (error) {
      throw new InternalServerErrorException(`Failed to parse quiz JSON: ${error?.message || error}`);
    }
  }

  private extractJson(body: string): string | null {
    const firstBrace = body.indexOf('{');
    const lastBrace = body.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }
    return body.slice(firstBrace, lastBrace + 1);
  }
}

function isHuggingFaceObject(value: unknown): value is HuggingFaceObject {
  return (
    typeof value === 'object' && value !== null && 'generated_text' in value
  );
}

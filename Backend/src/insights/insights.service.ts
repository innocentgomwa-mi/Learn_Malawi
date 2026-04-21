import { Injectable } from '@nestjs/common';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { StudentProgressService } from '../student-progress/student-progress.service';

interface InsightsParams {
  level?: string;
  subject?: string;
  limit?: number;
}

@Injectable()
export class InsightsService {
  constructor(
    private readonly activityLogService: ActivityLogService,
    private readonly studentProgressService: StudentProgressService,
  ) {}

  async getInsights({ level, subject, limit }: InsightsParams = {}) {
    const [activities, quizAttemptsRaw, quizSubjectPool] = await Promise.all([
      this.activityLogService.findAll(limit, undefined, level, undefined),
      this.studentProgressService.findAll(undefined, 'quiz', level, subject),
      this.studentProgressService.findAll(undefined, 'quiz', level, undefined),
    ]);

    const subjects = [...new Set((quizSubjectPool || []).map((entry) => entry.subject).filter(Boolean))];

    const normalizedQuizAttempts = (quizAttemptsRaw || []).map((entry) => {
      const scoreValue = typeof entry.score === 'number'
        ? entry.score
        : entry.total_questions && entry.correct_answers
          ? Math.round((entry.correct_answers / entry.total_questions) * 100)
          : 0;

      const passedValue = typeof entry.passed === 'boolean'
        ? entry.passed
        : scoreValue >= 50;

      return {
        ...entry,
        user_email: entry.student_email,
        user_name: entry.student_name || entry.student_email,
        score_percentage: scoreValue,
        passed: passedValue,
        created_date: entry.completed_at || entry.createdDate,
        quiz_title: entry.quiz_title || entry.resource_title,
        topics_failed: entry.topics_failed || [],
      };
    });

    const summary = {
      uniqueStudents: new Set(normalizedQuizAttempts.map((q) => q.user_email)).size,
      totalAttempts: normalizedQuizAttempts.length,
      avgScore: normalizedQuizAttempts.length
        ? parseFloat(
            (
              normalizedQuizAttempts.reduce((sum, q) => sum + q.score_percentage, 0) /
              normalizedQuizAttempts.length
            ).toFixed(1),
          )
        : 0,
      passRate: normalizedQuizAttempts.length
        ? Math.round(
            (normalizedQuizAttempts.filter((q) => q.passed).length / normalizedQuizAttempts.length) * 100,
          )
        : 0,
      atRiskCount: Object.values(
        normalizedQuizAttempts.reduce((acc, q) => {
          if (!acc[q.user_email]) acc[q.user_email] = [];
          acc[q.user_email].push(q.score_percentage);
          return acc;
        }, {} as Record<string, number[]>),
      ).filter((scores) => scores.reduce((a, b) => a + b, 0) / scores.length < 50).length,
      totalTimeMin: Math.round(
        (activities.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) || 0) / 60,
      ),
    };

    return {
      activities,
      quizAttempts: normalizedQuizAttempts,
      subjects,
      summary,
    };
  }
}

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
    const [activities, progressRaw] = await Promise.all([
      this.activityLogService.findAll(limit),
      this.studentProgressService.findAll(),
    ]);

    const filtered = (progressRaw || []).filter((entry) => {
      if (level && entry.level !== level) return false;
      if (subject && entry.subject !== subject) return false;
      return true;
    });

    const subjects = [...new Set((progressRaw || []).map((e) => e.subject).filter(Boolean))];

    const quizEntries = filtered.filter((entry) => entry.entry_type === 'quiz');

    const normalizedQuizAttempts = quizEntries.map((entry) => ({
      ...entry,
      user_email: entry.student_email,
      user_name: entry.student_email,
      score_percentage: entry.score ?? entry.average_score ?? 0,
      passed: (entry.score ?? entry.average_score ?? 0) >= 50,
      created_date: entry.completed_at || entry.createdDate,
      quiz_title: entry.quiz_title || entry.resource_title || entry.subject,
      topics_failed: Array.isArray(entry.topics_failed) ? entry.topics_failed : [],
    }));

    const summary = {
      uniqueStudents: new Set(normalizedQuizAttempts.map((q) => q.user_email)).size,
      totalAttempts: normalizedQuizAttempts.length,
      avgScore: normalizedQuizAttempts.length
        ? parseFloat((normalizedQuizAttempts.reduce((sum, q) => sum + q.score_percentage, 0) / normalizedQuizAttempts.length).toFixed(1))
        : 0,
      passRate: normalizedQuizAttempts.length
        ? Math.round((normalizedQuizAttempts.filter((q) => q.passed).length / normalizedQuizAttempts.length) * 100)
        : 0,
      atRiskCount: Object.values(
        normalizedQuizAttempts.reduce((acc, q) => {
          if (!acc[q.user_email]) acc[q.user_email] = [];
          acc[q.user_email].push(q.score_percentage);
          return acc;
        }, {} as Record<string, number[]>),
      ).filter((scores) => scores.reduce((a, b) => a + b, 0) / scores.length < 50).length,
      totalTimeMin: Math.round(
        ((activities || []).reduce((sum, activity) => sum + Number(activity.duration_seconds || 0), 0) || 0) / 60,
      ),
    };

    return { activities, quizAttempts: normalizedQuizAttempts, subjects, summary };
  }
}

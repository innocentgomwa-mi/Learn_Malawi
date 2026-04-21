// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookX } from "lucide-react";

export default function WeakTopics({ quizAttempts }) {
  // Aggregate all failed topics across all students
  const topicCounts = {};
  quizAttempts.forEach((q) => {
    (q.topics_failed || []).forEach((topic) => {
      if (!topicCounts[topic]) topicCounts[topic] = { topic, count: 0, subject: q.subject, level: q.level };
      topicCounts[topic].count += 1;
    });
  });

  const topics = Object.values(topicCounts).sort((a, b) => b.count - a.count);

  const levelColors = { MSCE: "bg-purple-100 text-purple-700", JCE: "bg-blue-100 text-blue-700", PSLC: "bg-green-100 text-green-700", "Standard 1-8": "bg-teal-100 text-teal-700" };

  return (
    <Card className="border-red-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <BookX className="w-4 h-4 text-red-500" />
          Topics Students Struggle With Most
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {topics.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No weak topics identified yet.</p>}
          {topics.map((t) => (
            <div key={t.topic} className="flex items-center justify-between p-3 rounded-lg bg-red-50">
              <div>
                <p className="font-medium text-sm text-gray-800">{t.topic}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">📚 {t.subject}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[t.level] || "bg-gray-100 text-gray-600"}`}>{t.level}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-red-600 font-bold text-sm">{t.count}</span>
                <p className="text-xs text-gray-400">student{t.count !== 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle, Star, Search, LogIn, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

const ACTION_CONFIG = {
  resource_viewed:     { icon: BookOpen,    color: "bg-blue-100 text-blue-600",   label: "Viewed" },
  resource_downloaded: { icon: FileText,    color: "bg-green-100 text-green-600", label: "Downloaded" },
  resource_rated:      { icon: Star,        color: "bg-amber-100 text-amber-600", label: "Rated" },
  quiz_started:        { icon: Clock,       color: "bg-purple-100 text-purple-600",label: "Started Quiz" },
  quiz_completed:      { icon: CheckCircle, color: "bg-green-100 text-green-600", label: "Completed Quiz" },
  search_performed:    { icon: Search,      color: "bg-gray-100 text-gray-600",   label: "Searched" },
  login:               { icon: LogIn,       color: "bg-indigo-100 text-indigo-600",label: "Logged in" },
};

export default function StudentRecentActivity({ currentUser }) {
  const email = currentUser?.email;

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["student-activity", email],
    queryFn: () => email
      ? apiClient.entities.ActivityLog.filter({ user_email: email }, "-created_date", 30)
      : Promise.resolve([]),
    enabled: !!email,
  });

  if (!email) return (
    <div className="text-center py-20 text-gray-400">
      <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Sign in to view your activity</p>
    </div>
  );

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading activity...</div>;

  if (logs.length === 0) return (
    <div className="text-center py-20 text-gray-400">
      <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="text-lg font-medium">No activity yet</p>
      <p className="text-sm mt-1">Start exploring resources to see your history here</p>
    </div>
  );

  const recentResources = logs.filter(l => l.action === "resource_viewed" && l.resource_title).slice(0, 5);
  const quizLogs = logs.filter(l => l.action === "quiz_completed");

  return (
    <div className="space-y-5">
      {/* Recent Resources */}
      {recentResources.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Recently Accessed Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentResources.map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{log.resource_title}</p>
                    <p className="text-xs text-gray-400">{log.subject} · {log.level}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatDistanceToNow(new Date(log.created_date), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz history */}
      {quizLogs.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" /> Quiz History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quizLogs.slice(0, 8).map((log, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{log.resource_title || "Quiz"}</p>
                    <p className="text-xs text-gray-400">{log.subject} · {formatDistanceToNow(new Date(log.created_date), { addSuffix: true })}</p>
                  </div>
                  {log.score !== undefined && log.score !== null && (
                    <span className={`text-sm font-bold px-2 py-1 rounded-lg ${log.score >= 70 ? "bg-green-100 text-green-700" : log.score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {log.score}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full activity timeline */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800">Full Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
            <div className="space-y-3 ml-2">
              {logs.map((log, i) => {
                const cfg = ACTION_CONFIG[log.action] || { icon: Clock, color: "bg-gray-100 text-gray-600", label: log.action };
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex items-start gap-3 pl-5 relative">
                    <div className={`absolute left-0 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                      <Icon className="w-2.5 h-2.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{cfg.label}</span>
                        {log.resource_title && <span className="text-gray-500"> — {log.resource_title}</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {log.subject && <span className="text-xs text-gray-400">{log.subject}</span>}
                        {log.score != null && <span className="text-xs font-medium text-green-600">Score: {log.score}%</span>}
                        <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(log.created_date), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

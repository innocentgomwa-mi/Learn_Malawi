import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, GraduationCap, ClipboardCheck, Megaphone, TrendingUp, BookOpen, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminOverview() {
  const { data: posts = [] } = useQuery({ queryKey: ["posts"], queryFn: () => apiClient.entities.TeacherPost.list() });
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers"], queryFn: () => apiClient.entities.Teacher.list() });
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => apiClient.entities.Student.list() });
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements"], queryFn: () => apiClient.entities.Announcement.list() });

  const pending = posts.filter(p => p.status === "pending").length;
  const approved = posts.filter(p => p.status === "approved").length;
  const rejected = posts.filter(p => p.status === "rejected").length;

  const stats = [
    { label: "Total Students", value: students.length, icon: Users, color: "bg-slate-500", light: "bg-slate-50 text-slate-700" },
    { label: "Total Teachers", value: teachers.length, icon: GraduationCap, color: "bg-slate-500", light: "bg-slate-50 text-slate-700" },
    { label: "Pending Approvals", value: pending, icon: ClipboardCheck, color: "bg-slate-500", light: "bg-slate-50 text-slate-700" },
    { label: "Published Resources", value: approved, icon: BookOpen, color: "bg-slate-500", light: "bg-slate-50 text-slate-700" },
  ];

  const recentPosts = posts.slice(0, 5);

  const statusColor = (s) => ({
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  }[s] || "bg-gray-100 text-gray-700");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to the Learn Malawi Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, light }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${light}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content breakdown + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Post breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">Content Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Pending Review", count: pending, color: "bg-amber-400" },
              { label: "Approved", count: approved, color: "bg-green-400" },
              { label: "Rejected", count: rejected, color: "bg-red-400" },
            ].map(({ label, count, color }) => {
              const total = posts.length || 1;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className={`h-2 rounded-full ${color}`} style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent posts */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No submissions yet</p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map(post => (
                  <div key={post.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-start gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400">{post.subject} · {post.level}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${statusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick announcements summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-slate-600" />
            Active Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.filter(a => a.is_published).length === 0 ? (
            <p className="text-sm text-gray-400">No active announcements</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {announcements.filter(a => a.is_published).slice(0, 4).map(a => (
                <div key={a.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-600 mt-1 capitalize">{a.target_audience} · {a.priority} priority</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

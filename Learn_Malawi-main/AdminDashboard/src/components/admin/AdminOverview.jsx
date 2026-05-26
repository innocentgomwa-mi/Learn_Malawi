import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, GraduationCap, ClipboardCheck, Megaphone, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/api/apiClient";

export default function AdminOverview({ refreshSeconds = 0 }) {
  const intervalMs = refreshSeconds > 0 ? refreshSeconds * 1000 : false;
  const { data: posts = [] } = useQuery({ queryKey: ["posts"], queryFn: () => apiClient.entities.TeacherPost.list(), refetchInterval: intervalMs });
  const { data: studyNotes = [] } = useQuery({ queryKey: ["study-notes"], queryFn: () => apiClient.entities.StudyNote.list(), refetchInterval: intervalMs });
  const { data: tutorials = [] } = useQuery({ queryKey: ["tutorials"], queryFn: () => apiClient.entities.Tutorial.list(), refetchInterval: intervalMs });
  const { data: pastPapers = [] } = useQuery({ queryKey: ["past-papers"], queryFn: () => apiClient.entities.PastPaper.list(), refetchInterval: intervalMs });
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers"], queryFn: () => apiClient.entities.Teacher.list(), refetchInterval: intervalMs });
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => apiClient.entities.Student.list(), refetchInterval: intervalMs });
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements"], queryFn: () => apiClient.entities.Announcement.list({ published: true }), refetchInterval: intervalMs });

  const publishedResourceCount = (Array.isArray(posts) ? posts.length : 0)
    + (Array.isArray(studyNotes) ? studyNotes.length : 0)
    + (Array.isArray(tutorials) ? tutorials.length : 0)
    + (Array.isArray(pastPapers) ? pastPapers.length : 0);

  const stats = [
    { label: "Total Students", value: students.length, icon: Users, color: "bg-slate-500", light: "bg-slate-50 text-slate-700" },
    { label: "Total Teachers", value: teachers.length, icon: GraduationCap, color: "bg-slate-500", light: "bg-slate-50 text-slate-700" },
    { label: "Teacher Posts", value: posts.length, icon: ClipboardCheck, color: "bg-slate-500", light: "bg-slate-50 text-slate-700" },
    { label: "Published Resources", value: publishedResourceCount, icon: BookOpen, color: "bg-slate-500", light: "bg-slate-50 text-slate-700" },
  ];

  const normalizeUpload = (item, resourceType) => {
    const uploadedAt = item.created_date ?? item.createdDate ?? item.createdAt;
    return {
      id: `${resourceType}-${item.id}`,
      title: item.title || item.name || `${resourceType} upload`,
      subject: item.subject || item.resource_subject || 'General',
      level: item.level || item.grade || 'All levels',
      author: item.author_name || item.teacher_name || item.author_email || item.teacher_email || 'Teacher',
      uploadedAt,
      resourceType,
      sortDate: new Date(uploadedAt || Date.now()).getTime(),
    };
  };

  const recentUploads = [
    ...(Array.isArray(posts) ? posts.map((post) => normalizeUpload(post, 'Teacher Post')) : []),
    ...(Array.isArray(studyNotes) ? studyNotes.map((note) => normalizeUpload(note, 'Study Note')) : []),
    ...(Array.isArray(tutorials) ? tutorials.map((tutorial) => normalizeUpload(tutorial, 'Tutorial')) : []),
    ...(Array.isArray(pastPapers) ? pastPapers.map((paper) => normalizeUpload(paper, 'Past Paper')) : []),
  ]
    .sort((a, b) => b.sortDate - a.sortDate)
    .slice(0, 5);

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
        {/* Content summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">Published Content Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Teacher Posts", count: posts.length, color: "bg-slate-400" },
              { label: "Study Notes", count: studyNotes.length, color: "bg-emerald-400" },
              { label: "Tutorials", count: tutorials.length, color: "bg-blue-400" },
              { label: "Past Papers", count: pastPapers.length, color: "bg-violet-400" },
            ].map(({ label, count, color }) => {
              const total = Math.max(posts.length + studyNotes.length + tutorials.length + pastPapers.length, 1);
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

        {/* Recent uploads */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">Latest Teacher Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUploads.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No recent uploads yet</p>
            ) : (
              <div className="space-y-3">
                {recentUploads.map(upload => (
                  <div key={upload.id} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{upload.title}</p>
                        <p className="text-xs text-slate-500 truncate">{upload.subject || 'General'} · {upload.level || 'All levels'}</p>
                      </div>
                      {upload.uploadedAt && <span className="text-xs text-slate-400">{new Date(upload.uploadedAt).toLocaleDateString()}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-white px-2 py-1 border border-slate-200">{upload.resourceType}</span>
                      <span className="rounded-full bg-white px-2 py-1 border border-slate-200">{upload.author}</span>
                    </div>
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
          {announcements.filter(a => (a.isPublished ?? a.is_published)).length === 0 ? (
            <p className="text-sm text-gray-400">No active announcements</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {announcements.filter(a => (a.isPublished ?? a.is_published)).slice(0, 4).map(a => (
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

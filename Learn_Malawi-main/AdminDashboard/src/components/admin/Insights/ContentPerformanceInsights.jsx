import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Star, Download, Eye, Trophy } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"];

export default function ContentPerformanceInsights() {
  const { data: posts = [] } = useQuery({ queryKey: ["cp-posts"], queryFn: () => apiClient.entities.TeacherPost.list() });
  const { data: logs = [] } = useQuery({ queryKey: ["cp-logs"], queryFn: () => apiClient.entities.ActivityLog.list() });
  const { data: ratings = [] } = useQuery({ queryKey: ["cp-ratings"], queryFn: () => apiClient.entities.ResourceRating.list() });
  const { data: teachers = [] } = useQuery({ queryKey: ["cp-teachers"], queryFn: () => apiClient.entities.Teacher.list() });

  // Resources by subject
  const bySubject = useMemo(() => {
    const m = {};
    posts.forEach(p => { m[p.subject] = (m[p.subject] || 0) + 1; });
    return Object.entries(m).map(([subject, count]) => ({ subject: subject.slice(0, 10), count })).sort((a, b) => b.count - a.count);
  }, [posts]);

  // Resources by content type
  const byType = useMemo(() => {
    const m = {};
    posts.forEach(p => {
      const label = p.content_type?.replace(/_/g, " ") || "other";
      m[label] = (m[label] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [posts]);

  // Most viewed resources
  const viewCounts = useMemo(() => {
    const m = {};
    logs.filter(l => l.action === "resource_viewed").forEach(l => {
      if (l.resource_title) m[l.resource_title] = (m[l.resource_title] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([title, views]) => ({ title, views }));
  }, [logs]);

  // Download counts
  const downloadCounts = useMemo(() => {
    const m = {};
    logs.filter(l => l.action === "resource_downloaded").forEach(l => {
      if (l.resource_title) m[l.resource_title] = (m[l.resource_title] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([title, downloads]) => ({ title, downloads }));
  }, [logs]);

  // Top contributing teachers (by published posts)
  const teacherContribs = useMemo(() => {
    const m = {};
    posts.filter(p => p.status === "approved").forEach(p => {
      if (p.teacher_name) m[p.teacher_name] = (m[p.teacher_name] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  }, [posts]);

  // Average rating per resource
  const avgRatings = useMemo(() => {
    const m = {};
    ratings.forEach(r => {
      if (!m[r.resource_title]) m[r.resource_title] = [];
      m[r.resource_title].push(r.rating);
    });
    return Object.entries(m)
      .map(([title, rs]) => ({ title: title?.slice(0, 28), avg: (rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [ratings]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resources by subject */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Resources by Subject</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {bySubject.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resources by content type */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Content Types</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Most viewed */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-blue-500" /> Most Viewed</CardTitle>
          </CardHeader>
          <CardContent>
            {viewCounts.length === 0
              ? <p className="text-sm text-gray-400 text-center py-4">No view data yet</p>
              : <div className="space-y-2">
                  {viewCounts.map(({ title, views }, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 truncate max-w-40">{title}</span>
                      <Badge variant="secondary">{views} views</Badge>
                    </div>
                  ))}
                </div>
            }
          </CardContent>
        </Card>

        {/* Most downloaded */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Download className="w-4 h-4 text-emerald-500" /> Most Downloaded</CardTitle>
          </CardHeader>
          <CardContent>
            {downloadCounts.length === 0
              ? <p className="text-sm text-gray-400 text-center py-4">No download data yet</p>
              : <div className="space-y-2">
                  {downloadCounts.map(({ title, downloads }, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 truncate max-w-40">{title}</span>
                      <Badge variant="secondary">{downloads}</Badge>
                    </div>
                  ))}
                </div>
            }
          </CardContent>
        </Card>

        {/* Top rated */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> Top Rated</CardTitle>
          </CardHeader>
          <CardContent>
            {avgRatings.length === 0
              ? <p className="text-sm text-gray-400 text-center py-4">No ratings yet</p>
              : <div className="space-y-2">
                  {avgRatings.map(({ title, avg }, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 truncate max-w-40">{title}</span>
                      <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">★ {avg}</Badge>
                    </div>
                  ))}
                </div>
            }
          </CardContent>
        </Card>
      </div>

      {/* Top contributing teachers */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2"><Trophy className="w-4 h-4 text-orange-500" /> Top Contributing Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          {teacherContribs.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
            : <div className="flex flex-wrap gap-3">
                {teacherContribs.map(({ name, count }, i) => (
                  <div key={i} className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-xl">
                    <div className="w-7 h-7 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-700">{name[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{name}</p>
                      <p className="text-xs text-gray-500">{count} published resource{count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}
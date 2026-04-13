import React, { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen, CheckCircle, Star, Search, LogIn, FileText,
  Clock, Filter, Download, RefreshCw, User, GraduationCap,
  ShieldCheck, Megaphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const ACTION_CONFIG = {
  resource_viewed:      { icon: BookOpen,    color: "bg-blue-100 text-blue-600",    label: "Resource Viewed" },
  resource_downloaded:  { icon: Download,    color: "bg-green-100 text-green-600",  label: "Downloaded" },
  resource_rated:       { icon: Star,        color: "bg-amber-100 text-amber-600",  label: "Rated" },
  quiz_started:         { icon: Clock,       color: "bg-purple-100 text-purple-600",label: "Quiz Started" },
  quiz_completed:       { icon: CheckCircle, color: "bg-green-100 text-green-600",  label: "Quiz Completed" },
  post_submitted:       { icon: FileText,    color: "bg-indigo-100 text-indigo-600",label: "Post Submitted" },
  post_approved:        { icon: CheckCircle, color: "bg-green-100 text-green-600",  label: "Post Approved" },
  post_rejected:        { icon: FileText,    color: "bg-red-100 text-red-600",      label: "Post Rejected" },
  student_registered:   { icon: User,        color: "bg-blue-100 text-blue-600",    label: "Student Registered" },
  teacher_registered:   { icon: GraduationCap,color:"bg-emerald-100 text-emerald-600",label:"Teacher Registered"},
  announcement_published:{icon: Megaphone,   color: "bg-violet-100 text-violet-600",label: "Announcement Published"},
  search_performed:     { icon: Search,      color: "bg-gray-100 text-gray-600",    label: "Search Performed" },
  login:                { icon: LogIn,       color: "bg-indigo-100 text-indigo-600",label: "Login" },
  logout:               { icon: LogIn,       color: "bg-gray-100 text-gray-600",    label: "Logout" },
};

const ROLE_COLORS = { student: "bg-blue-100 text-blue-700", teacher: "bg-emerald-100 text-emerald-700", admin: "bg-purple-100 text-purple-700" };

export default function ActivityLogViewer() {
  const [filterAction, setFilterAction] = useState("all");
  const [drilldown, setDrilldown] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [searchUser, setSearchUser] = useState("");

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["activity-logs-admin"],
    queryFn: () => apiClient.entities.ActivityLog.list("-created_date", 500),
    refetchInterval: 30000,
  });

  const downloadCSV = () => {
    const headers = ["Time", "Action", "User Email", "User Name", "Role", "Resource", "Subject", "Level", "Score"];
    const rows = logs.map(l => [
      format(new Date(l.created_date), "yyyy-MM-dd HH:mm:ss"),
      l.action,
      l.user_email,
      l.user_name || "",
      l.user_role || "",
      l.resource_title || "",
      l.subject || "",
      l.level || "",
      l.score != null ? l.score : "",
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learnmalawi-activity-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learnmalawi-activity-log-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = logs.filter(log => {
    const matchAction = filterAction === "all" || log.action === filterAction;
    const matchRole = filterRole === "all" || log.user_role === filterRole;
    const matchUser = !searchUser || log.user_email?.toLowerCase().includes(searchUser.toLowerCase()) || log.user_name?.toLowerCase().includes(searchUser.toLowerCase());
    return matchAction && matchRole && matchUser;
  });

  // Summary stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter(l => new Date(l.created_date) >= today);
  const quizCompletions = logs.filter(l => l.action === "quiz_completed").length;
  const resourceViews = logs.filter(l => l.action === "resource_viewed").length;
  const uniqueUsers = new Set(logs.map(l => l.user_email)).size;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track all important platform events in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadCSV}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={downloadJSON}>
            <Download className="w-4 h-4 mr-1" /> JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "today", label: "Events Today", value: todayLogs.length, color: "text-slate-700 bg-slate-50", ring: "ring-slate-300" },
          { id: "users", label: "Unique Users", value: uniqueUsers, color: "text-purple-600 bg-purple-50", ring: "ring-purple-400" },
          { id: "quizzes", label: "Quiz Completions", value: quizCompletions, color: "text-green-600 bg-green-50", ring: "ring-green-400" },
          { id: "views", label: "Resource Views", value: resourceViews, color: "text-amber-600 bg-amber-50", ring: "ring-amber-400" },
        ].map(({ id, label, value, color, ring }) => (
          <Card key={id} onClick={() => setDrilldown(drilldown === id ? null : id)}
            className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${drilldown === id ? `ring-2 ring-offset-1 ${ring}` : ""}`}>
            <CardContent className={`p-4 rounded-xl ${color}`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs mt-0.5 opacity-80">{label}</p>
              <p className="text-xs mt-1 opacity-70">{drilldown === id ? "▲ Hide" : "▼ Inspect"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drilldown panel */}
      {drilldown && (() => {
        const drillLogs =
          drilldown === "today" ? todayLogs :
          drilldown === "quizzes" ? logs.filter(l => l.action === "quiz_completed") :
          drilldown === "views" ? logs.filter(l => l.action === "resource_viewed") :
          null;
        const uniqueUserList = drilldown === "users" ?
          [...new Map(logs.map(l => [l.user_email, l])).values()] : null;
        const drillTitle = { today: "Events Today", users: "All Unique Users", quizzes: "Quiz Completions", views: "Resource Views" }[drilldown];
        return (
          <Card className="border-0 shadow-md ring-1 ring-gray-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">{drillTitle}</CardTitle>
              <button onClick={() => setDrilldown(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100">✕ Close</button>
            </CardHeader>
            <CardContent className="max-h-72 overflow-y-auto space-y-1.5">
              {uniqueUserList ? (
                uniqueUserList.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No users</p> :
                uniqueUserList.map((l, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                    <div><p className="font-medium text-gray-800">{l.user_name || l.user_email}</p><p className="text-xs text-gray-400">{l.user_email}</p></div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[l.user_role] || "bg-gray-100 text-gray-600"}`}>{l.user_role}</span>
                  </div>
                ))
              ) : drillLogs.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No events</p> :
                drillLogs.map((l, i) => {
                  const cfg = ACTION_CONFIG[l.action] || { icon: Clock, color: "bg-gray-100 text-gray-600", label: l.action };
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.color}`}><Icon className="w-3 h-3" /></div>
                        <div><p className="text-sm font-medium text-gray-800">{l.user_name || l.user_email}</p><p className="text-xs text-gray-400">{l.resource_title || cfg.label}</p></div>
                      </div>
                      <div className="text-right">
                        {l.score != null && <p className={`text-xs font-bold ${l.score >= 70 ? "text-green-600" : "text-amber-600"}`}>{l.score}%</p>}
                        <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(l.created_date), { addSuffix: true })}</p>
                      </div>
                    </div>
                  );
                })
              }
            </CardContent>
          </Card>
        );
      })()}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-36">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input placeholder="Search user..." className="pl-8 h-9 text-sm" value={searchUser} onChange={e => setSearchUser(e.target.value)} />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="All Actions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {Object.entries(ACTION_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-32 h-9 text-sm"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} events{filtered.length !== logs.length ? ` (filtered from ${logs.length})` : ""}</p>

      {/* Log table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading logs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No events match your filters</div>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Event</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Resource</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Subject / Level</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log, i) => {
                  const cfg = ACTION_CONFIG[log.action] || { icon: Clock, color: "bg-gray-100 text-gray-600", label: log.action };
                  const Icon = cfg.icon;
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 whitespace-nowrap">{cfg.label}</p>
                            {log.score != null && (
                              <span className={`text-xs font-medium ${log.score >= 70 ? "text-green-600" : "text-amber-600"}`}>
                                Score: {log.score}%
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div>
                          <p className="text-gray-800">{log.user_name || log.user_email}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[log.user_role] || "bg-gray-100 text-gray-600"}`}>
                              {log.user_role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-gray-600 text-xs max-w-40 truncate">{log.resource_title || "—"}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex gap-1">
                          {log.subject && <Badge variant="secondary" className="text-xs">{log.subject}</Badge>}
                          {log.level && <Badge variant="outline" className="text-xs">{log.level}</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.created_date), { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

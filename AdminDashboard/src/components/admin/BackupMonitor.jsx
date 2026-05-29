import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Database,
  RefreshCw,
  HardDrive,
  Users,
  FileText,
  Activity,
  Shield,
} from "lucide-react";
import { apiClient } from "@/api/apiClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format, subDays, differenceInHours } from "date-fns";

const BACKUP_TYPES = [
  { key: "students", label: "Students", icon: Users, color: "text-blue-600" },
  { key: "teachers", label: "Teachers", icon: Users, color: "text-purple-600" },
  { key: "resources", label: "Resources", icon: FileText, color: "text-green-600" },
  { key: "logs", label: "Activity Logs", icon: Activity, color: "text-orange-600" },
  { key: "audit", label: "Audit Trail", icon: Shield, color: "text-red-600" },
];

function StatusBadge({ status }) {
  if (status === "ok")
    return <Badge className="bg-green-100 text-green-700 border-green-200">Healthy</Badge>;
  if (status === "warning")
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Warning</Badge>;
  return <Badge className="bg-red-100 text-red-700 border-red-200">Alert</Badge>;
}

export default function BackupMonitor() {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [exportLog, setExportLog] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("backup_export_log") || "[]");
    } catch {
      return [];
    }
  });

  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => apiClient.entities.Student.list() });
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers"], queryFn: () => apiClient.entities.Teacher.list() });
  const { data: studyNotes = [] } = useQuery({ queryKey: ["study-notes"], queryFn: () => apiClient.entities.StudyNote.list() });
  const { data: tutorials = [] } = useQuery({ queryKey: ["tutorials"], queryFn: () => apiClient.entities.Tutorial.list() });
  const { data: pastPapers = [] } = useQuery({ queryKey: ["past-papers"], queryFn: () => apiClient.entities.PastPaper.list() });
  const { data: quizzes = [] } = useQuery({ queryKey: ["quizzes"], queryFn: () => apiClient.entities.Quiz.list() });
  const { data: careerResources = [] } = useQuery({ queryKey: ["career-resources"], queryFn: () => apiClient.entities.CareerResource.list() });
  const { data: activityLogs = [] } = useQuery({ queryKey: ["activity-logs"], queryFn: () => apiClient.entities.ActivityLog.list() });
  const { data: auditLogs = [] } = useQuery({ queryKey: ["audit-logs"], queryFn: () => apiClient.entities.DataChangeHistory.list() });

  const resources = [
    ...studyNotes,
    ...tutorials,
    ...pastPapers,
    ...quizzes,
    ...careerResources,
  ];

  const counts = {
    students: students.length,
    teachers: teachers.length,
    resources: resources.length,
    logs: activityLogs.length,
    audit: auditLogs.length,
  };

  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

  // Simulated backup schedule — last backup at midnight, next at midnight tonight
  const now = new Date();
  const lastBackup = new Date(now);
  lastBackup.setHours(0, 0, 0, 0);
  const nextBackup = new Date(lastBackup);
  nextBackup.setDate(nextBackup.getDate() + 1);
  const hoursSinceLast = differenceInHours(now, lastBackup);
  const hoursUntilNext = differenceInHours(nextBackup, now);
  const backupHealth = hoursSinceLast <= 25 ? "ok" : hoursSinceLast <= 48 ? "warning" : "alert";

  // Build 14-day export trend from localStorage log
  const trendData = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(now, 13 - i);
    const label = format(day, "MMM d");
    const count = exportLog.filter(
      (e) => format(new Date(e.timestamp), "MMM d") === label
    ).length;
    return { date: label, exports: count };
  });

  // Entity size chart
  const entityData = BACKUP_TYPES.map((t) => ({
    name: t.label,
    records: counts[t.key],
  }));

  const handleManualExport = (type) => {
    const data = {
      students,
      teachers,
      resources,
      logs: activityLogs,
      audit: auditLogs,
    }[type] || [];

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${type}_${format(now, "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);

    const newEntry = { type, timestamp: now.toISOString(), count: data.length };
    const updated = [newEntry, ...exportLog].slice(0, 50);
    setExportLog(updated);
    localStorage.setItem("backup_export_log", JSON.stringify(updated));
  };

  const handleFullExport = () => {
    const payload = { students, teachers, resources, activityLogs, auditLogs, exportedAt: now.toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `full_backup_${format(now, "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);

    const newEntry = { type: "full", timestamp: now.toISOString(), count: totalRecords };
    const updated = [newEntry, ...exportLog].slice(0, 50);
    setExportLog(updated);
    localStorage.setItem("backup_export_log", JSON.stringify(updated));
    setLastRefreshed(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup Monitoring</h1>
          <p className="text-sm text-gray-500">Last refreshed: {format(lastRefreshed, "PPpp")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLastRefreshed(new Date())}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white" onClick={handleFullExport}>
            <Download className="w-4 h-4 mr-1" /> Full Backup Now
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={`border-l-4 ${backupHealth === "ok" ? "border-l-green-500" : backupHealth === "warning" ? "border-l-yellow-500" : "border-l-red-500"}`}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Backup Health</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{backupHealth === "ok" ? "All Good" : "Check Needed"}</p>
                <p className="text-xs text-gray-500 mt-0.5">{hoursSinceLast}h since last backup</p>
              </div>
              {backupHealth === "ok"
                ? <CheckCircle2 className="w-8 h-8 text-green-500" />
                : <AlertTriangle className="w-8 h-8 text-yellow-500" />}
            </div>
            <div className="mt-3"><StatusBadge status={backupHealth} /></div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Next Scheduled</p>
                <p className="text-lg font-bold text-gray-800 mt-1">in {hoursUntilNext}h</p>
                <p className="text-xs text-gray-500 mt-0.5">{format(nextBackup, "PPp")}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-3"><Badge className="bg-blue-100 text-blue-700 border-blue-200">Scheduled Daily</Badge></div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Records</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{totalRecords.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">across {BACKUP_TYPES.length} data types</p>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-3"><Badge className="bg-purple-100 text-purple-700 border-purple-200">{exportLog.length} exports logged</Badge></div>
          </CardContent>
        </Card>
      </div>

      {/* Data Snapshot & Manual Export */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gray-500" /> Data Snapshot — Export by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BACKUP_TYPES.map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{counts[key].toLocaleString()} records</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleManualExport(key)}>
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Export Activity — Last 14 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="exports" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Records by Data Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={entityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="records" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Export Log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-500" /> Recent Export Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exportLog.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No exports yet. Use the buttons above to export data.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {exportLog.slice(0, 10).map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="font-medium capitalize text-gray-800">{entry.type} backup</span>
                    <Badge variant="outline" className="text-xs">{entry.count} records</Badge>
                  </div>
                  <span className="text-xs text-gray-400">{format(new Date(entry.timestamp), "MMM d, yyyy HH:mm")}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
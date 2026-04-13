import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Database, CheckCircle, Clock, AlertCircle, Archive } from "lucide-react";
import { format } from "date-fns";

export default function BackupRestore() {
  const [downloading, setDownloading] = useState(null);
  const [backupLog, setBackupLog] = useState([]);

  const { data: posts = [] } = useQuery({ queryKey: ["backup-posts"], queryFn: () => apiClient.entities.TeacherPost.list() });
  const { data: teachers = [] } = useQuery({ queryKey: ["backup-teachers"], queryFn: () => apiClient.entities.Teacher.list() });
  const { data: students = [] } = useQuery({ queryKey: ["backup-students"], queryFn: () => apiClient.entities.Student.list() });
  const { data: announcements = [] } = useQuery({ queryKey: ["backup-announcements"], queryFn: () => apiClient.entities.Announcement.list() });
  const { data: logs = [] } = useQuery({ queryKey: ["backup-logs"], queryFn: () => apiClient.entities.ActivityLog.list("-created_date", 500) });
  const { data: history = [] } = useQuery({ queryKey: ["backup-history"], queryFn: () => apiClient.entities.DataChangeHistory.list() });

  const totalRecords = posts.length + teachers.length + students.length + announcements.length + logs.length;

  const downloadBackup = async (type) => {
    setDownloading(type);
    const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm");

    let content, filename, mimeType;

    if (type === "full") {
      const backup = {
        exported_at: new Date().toISOString(),
        version: "1.0",
        platform: "Learn Malawi Admin",
        data: { teachers, students, posts, announcements, activity_logs: logs, change_history: history }
      };
      content = JSON.stringify(backup, null, 2);
      filename = `learnmalawi-full-backup-${timestamp}.json`;
      mimeType = "application/json";
    } else if (type === "logs") {
      const headers = ["Time", "Action", "User Email", "User Name", "Role", "Resource", "Subject", "Level", "Score"];
      const rows = logs.map(l => [
        format(new Date(l.created_date), "yyyy-MM-dd HH:mm:ss"),
        l.action, l.user_email, l.user_name || "", l.user_role || "",
        l.resource_title || "", l.subject || "", l.level || "",
        l.score != null ? l.score : "",
      ]);
      content = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      filename = `learnmalawi-activity-logs-${timestamp}.csv`;
      mimeType = "text/csv";
    } else if (type === "audit") {
      content = JSON.stringify(history, null, 2);
      filename = `learnmalawi-audit-trail-${timestamp}.json`;
      mimeType = "application/json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);

    setBackupLog(prev => [{ type, filename, timestamp: new Date().toISOString() }, ...prev.slice(0, 9)]);
    setDownloading(null);
  };

  const backupOptions = [
    {
      type: "full", icon: Archive, color: "text-slate-700 bg-slate-50",
      label: "Full Platform Backup",
      description: `All data — teachers, students, resources, logs · ${totalRecords} records`,
      format: "JSON",
    },
    {
      type: "logs", icon: Clock, color: "text-amber-600 bg-amber-50",
      label: "Activity Logs Export",
      description: `${logs.length} activity events`,
      format: "CSV",
    },
    {
      type: "audit", icon: CheckCircle, color: "text-purple-600 bg-purple-50",
      label: "Audit Trail Export",
      description: `${history.length} admin action records`,
      format: "JSON",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Backup & Restore</h2>
        <p className="text-sm text-gray-500 mt-0.5">Download platform data snapshots for safekeeping</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {backupOptions.map(({ type, icon: Icon, color, label, description, format: fmt }) => (
          <Card key={type} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">{description}</p>
              <Button
                onClick={() => downloadBackup(type)}
                disabled={downloading === type}
                className="w-full"
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-1" />
                {downloading === type ? "Preparing..." : `Download ${fmt}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {backupLog.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Download History (This Session)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {backupLog.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-mono text-xs text-gray-600">{b.filename}</span>
                  </div>
                  <span className="text-xs text-gray-400">{format(new Date(b.timestamp), "HH:mm:ss")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-amber-200 bg-amber-50 shadow-none">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">About Automated Backups</p>
            <p className="text-xs text-amber-700 mt-1">Automated daily/weekly backups require a server-side scheduler. Use the manual download above regularly, or contact your hosting provider to set up automated database snapshots.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

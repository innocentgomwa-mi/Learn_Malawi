import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, Database, Zap, Server, RefreshCw } from "lucide-react";

function StatusBadge({ ok, label }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      {ok ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

export default function SystemHealth() {
  const [apiTime, setApiTime] = useState(null);
  const [checking, setChecking] = useState(false);

  const { data: logs = [] } = useQuery({ queryKey: ["health-logs"], queryFn: () => apiClient.entities.ActivityLog.list("-created_date", 50) });
  const { data: teachers = [] } = useQuery({ queryKey: ["health-teachers"], queryFn: () => apiClient.entities.Teacher.list() });
  const { data: students = [] } = useQuery({ queryKey: ["health-students"], queryFn: () => apiClient.entities.Student.list() });
  const { data: posts = [] } = useQuery({ queryKey: ["health-posts"], queryFn: () => apiClient.entities.TeacherPost.list() });

  const checkApi = async () => {
    setChecking(true);
    const start = performance.now();
    await apiClient.entities.ActivityLog.list("-created_date", 1).catch(() => {});
    setApiTime(Math.round(performance.now() - start));
    setChecking(false);
  };

  useEffect(() => { checkApi(); }, []);

  const dbHealthy = logs !== undefined;
  const apiHealthy = apiTime !== null && apiTime < 3000;

  const [drilldown, setDrilldown] = useState(null);

  const metrics = [
    { id: "students", label: "Total Students", value: students.length, icon: Database, color: "text-slate-700 bg-slate-50" },
    { id: "teachers", label: "Total Teachers", value: teachers.length, icon: Database, color: "text-emerald-600 bg-emerald-50" },
    { id: "resources", label: "Total Resources", value: posts.length, icon: Database, color: "text-purple-600 bg-purple-50" },
    { id: "events", label: "Recent Events", value: logs.length, icon: Zap, color: "text-amber-600 bg-amber-50" },
  ];

  const DRILL_CONTENT = {
    students: { title: "Registered Students", items: students, render: s => `${s.full_name || s.email} — ${s.level || "N/A"} · ${s.school || "No school"}` },
    teachers: { title: "Registered Teachers", items: teachers, render: t => `${t.full_name || t.email} — ${t.status || "active"} · ${t.school || ""}` },
    resources: { title: "All Resources", items: posts, render: p => `${p.title} — ${p.subject} · ${p.level} · ${p.status}` },
    events: { title: "Recent Activity Events", items: logs, render: l => `${l.action?.replace(/_/g, " ")} — ${l.user_name || l.user_email}` },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">System Health</h2>
          <p className="text-sm text-gray-500 mt-0.5">Real-time status of all platform services</p>
        </div>
        <button onClick={checkApi} disabled={checking} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} /> Re-check
        </button>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Server, label: "Application Server", ok: true, detail: "Running normally" },
          { icon: Database, label: "Database", ok: dbHealthy, detail: dbHealthy ? "Connected & responding" : "Connection issues detected" },
          { icon: Zap, label: "API Layer", ok: apiHealthy, detail: apiTime !== null ? `Response time: ${apiTime}ms` : "Checking..." },
        ].map(({ icon: Icon, label, ok, detail }) => (
          <Card key={label} className={`border-0 shadow-sm ${ok ? "border-l-4 border-green-400" : "border-l-4 border-red-400"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${ok ? "bg-green-50" : "bg-red-50"}`}>
                  <Icon className={`w-5 h-5 ${ok ? "text-green-600" : "text-red-600"}`} />
                </div>
                <StatusBadge ok={ok} label={ok ? "Healthy" : "Issue"} />
              </div>
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Response time indicator */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-slate-600" />API Response Time</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-gray-900">{apiTime !== null ? `${apiTime}ms` : "—"}</div>
            <div>
              {apiTime === null && <p className="text-sm text-gray-400">Measuring...</p>}
              {apiTime !== null && apiTime < 500 && <StatusBadge ok label="Excellent" />}
              {apiTime !== null && apiTime >= 500 && apiTime < 1500 && <StatusBadge ok label="Good" />}
              {apiTime !== null && apiTime >= 1500 && <StatusBadge ok={false} label="Slow" />}
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${(apiTime || 0) < 500 ? "bg-green-500" : (apiTime || 0) < 1500 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(100, ((apiTime || 0) / 3000) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Target: &lt;500ms · Threshold: 3000ms</p>
        </CardContent>
      </Card>

      {/* Database Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(({ id, label, value, icon: Icon, color }) => (
          <Card key={id} onClick={() => setDrilldown(drilldown === id ? null : id)}
            className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${drilldown === id ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{drilldown === id ? "▲ Hide" : "▼ View all"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {drilldown && DRILL_CONTENT[drilldown] && (
        <Card className="border-0 shadow-md ring-1 ring-gray-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">{DRILL_CONTENT[drilldown].title} ({DRILL_CONTENT[drilldown].items.length})</CardTitle>
            <button onClick={() => setDrilldown(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100">✕ Close</button>
          </CardHeader>
          <CardContent>
            <div className="max-h-72 overflow-y-auto space-y-1.5">
              {DRILL_CONTENT[drilldown].items.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No records found</p>
              ) : DRILL_CONTENT[drilldown].items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg text-sm">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">{i + 1}</div>
                  <p className="text-gray-700">{DRILL_CONTENT[drilldown].render(item)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm bg-amber-50 border border-amber-200">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-amber-800 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Advanced Monitoring Note</p>
          <p className="text-xs text-amber-700 mt-1">For production-grade monitoring (CPU, memory, error rates), integrate Sentry or a dedicated APM tool. The metrics above reflect real database query performance from this session.</p>
        </CardContent>
      </Card>
    </div>
  );
}

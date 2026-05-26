import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Shield, AlertTriangle, Users, LogIn, TrendingUp, Activity } from "lucide-react";
import { format, subDays, startOfDay, isValid } from "date-fns";

const parseDate = (value) => {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return isValid(date) ? date : null;
};

const getCreatedAt = (entry) => parseDate(entry?.createdDate ?? entry?.created_date);

const safeFormat = (value, dateFormat, fallback = "") => {
  const date = parseDate(value);
  return date ? format(date, dateFormat) : fallback;
};

export default function SecurityCenter() {
  const { data: logs = [] } = useQuery({
    queryKey: ["security-login-logs"],
    queryFn: () => apiClient.entities.ActivityLog.list({ limit: 500 }),
  });

  const { data: history = [] } = useQuery({
    queryKey: ["change-history"],
    queryFn: () => apiClient.entities.DataChangeHistory.list("-created_date", 100),
  });

  // Login trends — last 7 days
  const loginTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const label = format(day, "MMM d");
      const start = startOfDay(day).getTime();
      const end = start + 86400000;
      const logins = logs.filter((l) => {
        const created = getCreatedAt(l);
        return created?.getTime() >= start && created?.getTime() < end && l.action === "login";
      }).length;
      return { day: label, logins };
    });
  }, [logs]);

  // Active users (unique emails in last 24h)
  const cutoff24h = Date.now() - 86400000;
  const activeUsers24h = new Set(
    logs
      .filter((l) => {
        const created = getCreatedAt(l);
        return created?.getTime() > cutoff24h;
      })
      .map((l) => l.user_email),
  ).size;

  // Actions by role
  const roleBreakdown = useMemo(() => {
    const map = {};
    logs.forEach(l => { map[l.user_role] = (map[l.user_role] || 0) + 1; });
    return Object.entries(map).map(([role, count]) => ({ role, count }));
  }, [logs]);

  // Action frequency
  const actionFreq = useMemo(() => {
    const map = {};
    logs.forEach(l => { map[l.action] = (map[l.action] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([action, count]) => ({ action: action.replace(/_/g, " "), count }));
  }, [logs]);

  // Recent admin changes
  const recentChanges = history.slice(0, 10);

  const stats = [
    { label: "Active Users (24h)", value: activeUsers24h, icon: Users, color: "text-slate-700 bg-slate-50" },
    { label: "Total Events Logged", value: logs.length, icon: Activity, color: "text-green-600 bg-green-50" },
    { label: "Admin Actions", value: history.length, icon: Shield, color: "text-purple-600 bg-purple-50" },
    { label: "Login Events", value: logs.filter(l => l.action === "login").length, icon: LogIn, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Security Center</h2>
        <p className="text-sm text-gray-500 mt-0.5">Monitor authentication, user behaviour, and admin actions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
              <div><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-bold">{value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-slate-600" /> Login Trends (7 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={loginTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="logins" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Action Frequency</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={actionFreq} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="action" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-purple-600" /> Recent Admin Actions (Audit Trail)</CardTitle></CardHeader>
        <CardContent>
          {recentChanges.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No admin actions recorded yet</p>
          ) : (
            <div className="space-y-2">
              {recentChanges.map((h, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800 capitalize">{h.action.replace(/_/g, " ")} — <span className="text-purple-600">{h.entity_type}</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">By {h.performed_by_name || h.performed_by_email} {h.notes ? `· ${h.notes}` : ""}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-3">{safeFormat(h.created_date, "MMM d, HH:mm", "Unknown")}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

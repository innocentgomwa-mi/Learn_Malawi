import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
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

  const [reminderTarget, setReminderTarget] = useState('all');
  const [minAgeDays, setMinAgeDays] = useState(30);
  const [customMessage, setCustomMessage] = useState('');
  const [customSubject, setCustomSubject] = useState('');

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiClient.entities.User.list(),
  });

  const reminderMutation = useMutation({
    mutationFn: (payload) => apiClient.entities.PasswordReminder.send(payload),
    onSuccess: (data) => {
      toast({
        title: 'Password reminder sent',
        description: data?.message || 'Reminder notifications were sent successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Unable to send reminders',
        description: error?.data?.message || error?.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const eligibleReminderCount = useMemo(() => {
    const days = Math.max(0, Number(minAgeDays) || 0);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return users.filter((user) => {
      const updatedTime = new Date(user.updatedAt || user.createdAt).getTime();
      if (!Number.isFinite(updatedTime)) {
        return false;
      }
      const roleMatch =
        reminderTarget === 'all'
          ? true
          : reminderTarget === 'students'
          ? user.role === 'Student'
          : user.role === 'Teacher';
      return roleMatch && updatedTime < cutoff;
    }).length;
  }, [users, reminderTarget, minAgeDays]);

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
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-purple-600" /> Password Update Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-sm">Target audience</Label>
              <Select value={reminderTarget} onValueChange={setReminderTarget}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Minimum age (days)</Label>
              <Input
                type="number"
                min={0}
                value={minAgeDays}
                onChange={(event) => setMinAgeDays(Number(event.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Expected recipients</Label>
              <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{eligibleReminderCount} user{eligibleReminderCount === 1 ? '' : 's'}</div>
            </div>
          </div>

          <div className="grid gap-4 mt-4">
            <div>
              <Label className="text-sm">Optional email subject</Label>
              <Input
                value={customSubject}
                onChange={(event) => setCustomSubject(event.target.value)}
                className="mt-1"
                placeholder="Password reminder subject"
              />
            </div>
            <div>
              <Label className="text-sm">Message body</Label>
              <Textarea
                value={customMessage}
                onChange={(event) => setCustomMessage(event.target.value)}
                className="mt-1"
                rows={4}
                placeholder="Add an optional note for users."
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">This will email users who have not updated their profile in the selected timeframe.</div>
            <Button
              className="bg-blue-700 hover:bg-blue-800"
              disabled={eligibleReminderCount === 0 || reminderMutation.isLoading}
              onClick={() => reminderMutation.mutate({
                targetAudience: reminderTarget,
                minAgeDays,
                subject: customSubject,
                message: customMessage,
              })}
            >
              {reminderMutation.isLoading ? 'Sending...' : 'Send Reminder'}
            </Button>
          </div>
        </CardContent>
      </Card>

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

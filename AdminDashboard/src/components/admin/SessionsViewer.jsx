import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Activity, Globe } from "lucide-react";
import { formatDistanceToNow, format, subHours, subMinutes } from "date-fns";
import { apiClient } from "@/api/apiClient";

export default function SessionsViewer({ refreshSeconds = 15 }) {
  const intervalMs = refreshSeconds > 0 ? refreshSeconds * 1000 : false;
  const { data: logs = [] } = useQuery({
    queryKey: ["sessions-logs"],
    queryFn: () => apiClient.entities.ActivityLog.list("-created_date", 500),
    refetchInterval: intervalMs,
  });

  // Derive active sessions: users with activity in last 30 min
  const cutoff30min = subMinutes(new Date(), 30).getTime();
  const cutoff24h = subHours(new Date(), 24).getTime();

  const sessions = useMemo(() => {
    const userMap = {};
    logs.forEach((l) => {
      const timestamp = l?.createdDate ?? l?.created_date;
      const t = new Date(timestamp).getTime();
      if (Number.isNaN(t)) {
        return;
      }

      const userKey = l?.user_email || l?.user_name || `${l?.action || 'anonymous'}-${l?.resource_title || ''}`;
      const displayEmail = l?.user_email || l?.user_name || 'unknown';
      const displayName = l?.user_name || l?.user_email || 'Unknown User';

      if (!userMap[userKey] || t > userMap[userKey].lastSeen) {
        userMap[userKey] = {
          email: displayEmail,
          name: displayName,
          role: l?.user_role || 'student',
          lastSeen: t,
          actions: 0,
        };
      }
      userMap[userKey].actions++;
    });
    return Object.values(userMap).sort((a, b) => b.lastSeen - a.lastSeen);
  }, [logs]);

  const activeSessions = sessions.filter(s => s.lastSeen > cutoff30min);
  const today24h = sessions.filter(s => s.lastSeen > cutoff24h);

  const [drilldown, setDrilldown] = useState(null); // null | 'active' | 'today' | 'all'

  const drillSessions = drilldown === "active" ? activeSessions : drilldown === "today" ? today24h : drilldown === "all" ? sessions : null;
  const drillTitles = { active: "Active Now (last 30 min)", today: "Active Today (last 24h)", all: "All Tracked Users" };

  const ROLE_COLOR = { admin: "bg-purple-100 text-purple-700", teacher: "bg-emerald-100 text-emerald-700", student: "bg-slate-100 text-slate-700" };

  const SessionRow = ({ s }) => {
    const lastSeenDate = new Date(s.lastSeen);
    const lastSeenLabel = Number.isNaN(lastSeenDate.getTime())
      ? "unknown time"
      : formatDistanceToNow(lastSeenDate, { addSuffix: true });

    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
              {(s.name || s.email)[0].toUpperCase()}
            </div>
            {s.lastSeen > cutoff30min && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{s.name}</p>
            <p className="text-xs text-gray-400">{s.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <Badge variant="outline" className={`text-xs ${ROLE_COLOR[s.role] || ROLE_COLOR.student}`}>{s.role}</Badge>
            <p className="text-xs text-gray-400 mt-1">{s.actions} events</p>
          </div>
          <div className="text-xs text-gray-500 min-w-20 text-right">
            {lastSeenLabel}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Sessions</h2>
        <p className="text-sm text-gray-500 mt-0.5">Track who is currently active and recent user activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { id: "active", label: "Active Now (30 min)", value: activeSessions.length, icon: Activity, color: "text-green-600 bg-green-50", ring: "hover:ring-2 hover:ring-green-300" },
          { id: "today", label: "Active Today (24h)", value: today24h.length, icon: Users, color: "text-slate-700 bg-slate-50", ring: "hover:ring-2 hover:ring-slate-300" },
          { id: "all", label: "Total Tracked Users", value: sessions.length, icon: Globe, color: "text-purple-600 bg-purple-50", ring: "hover:ring-2 hover:ring-purple-300" },
        ].map(({ id, label, value, icon: Icon, color, ring }) => (
          <Card
            key={id}
            onClick={() => setDrilldown(drilldown === id ? null : id)}
            className={`border-0 shadow-sm cursor-pointer transition-all ${ring} ${drilldown === id ? "ring-2 ring-offset-1 " + (id === "active" ? "ring-green-400" : id === "today" ? "ring-slate-400" : "ring-purple-400") : ""}`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{drilldown === id ? "▲ Hide detail" : "▼ View detail"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drilldown panel */}
      {drilldown && drillSessions && (
        <Card className="border-0 shadow-md ring-1 ring-gray-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">{drillTitles[drilldown]} — {drillSessions.length} user{drillSessions.length !== 1 ? "s" : ""}</CardTitle>
            <button onClick={() => setDrilldown(null)} className="text-xs text-gray-400 hover:text-gray-600">✕ Close</button>
          </CardHeader>
          <CardContent className="space-y-2">
            {drillSessions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No users in this group</p>
            ) : drillSessions.map(s => <SessionRow key={s.email} s={s} />)}
          </CardContent>
        </Card>
      )}

      {activeSessions.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Active Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeSessions.map(s => <SessionRow key={s.email} s={s} />)}
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" /> All Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">No session data yet</p>
            : sessions.slice(0, 20).map(s => <SessionRow key={s.email} s={s} />)
          }
        </CardContent>
      </Card>
    </div>
  );
}

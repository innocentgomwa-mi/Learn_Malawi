import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line
} from "recharts";
import { Search, TrendingUp, AlertCircle, Users, Hash } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

export default function SearchAnalytics() {
  const [view, setView] = useState("daily"); // daily | weekly

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["search-logs"],
    queryFn: () => apiClient.entities.SearchLog.list({ limit: 500 }),
  });

  // --- Top search terms ---
  const topTerms = useMemo(() => {
    const counts = {};
    logs.forEach(l => {
      const term = (l.query || "").trim().toLowerCase();
      if (!term) return;
      counts[term] = (counts[term] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));
  }, [logs]);

  // --- Failed searches (0 results) ---
  const failedTerms = useMemo(() => {
    const counts = {};
    logs.filter(l => l.results_count === 0).forEach(l => {
      const term = (l.query || "").trim().toLowerCase();
      if (!term) return;
      counts[term] = (counts[term] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([term, count]) => ({ term, count }));
  }, [logs]);

  // --- Search trend (last 7 or 14 days) ---
  const trendData = useMemo(() => {
    const days = view === "daily" ? 7 : 14;
    return Array.from({ length: days }, (_, i) => {
      const day = subDays(new Date(), days - 1 - i);
      const label = format(day, view === "daily" ? "EEE" : "MMM d");
      const start = startOfDay(day).getTime();
      const end = start + 86400000;
      const count = logs.filter(l => {
        const t = new Date(l.created_date).getTime();
        return t >= start && t < end;
      }).length;
      return { label, count };
    });
  }, [logs, view]);

  // --- Summary stats ---
  const totalSearches = logs.length;
  const uniqueUsers = new Set(logs.map(l => l.user_email).filter(Boolean)).size;
  const failedCount = logs.filter(l => l.results_count === 0).length;
  const failedPct = totalSearches ? Math.round((failedCount / totalSearches) * 100) : 0;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-gray-400">Loading search analytics…</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" /> Search Analytics
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Monitor user search behaviour and identify content gaps</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Search className="w-4 h-4 text-blue-500" />} label="Total Searches" value={totalSearches} bg="bg-blue-50" />
        <StatCard icon={<Users className="w-4 h-4 text-green-500" />} label="Unique Users" value={uniqueUsers} bg="bg-green-50" />
        <StatCard icon={<Hash className="w-4 h-4 text-purple-500" />} label="Unique Terms" value={topTerms.length} bg="bg-purple-50" />
        <StatCard
          icon={<AlertCircle className="w-4 h-4 text-red-500" />}
          label="Failed Searches"
          value={`${failedCount} (${failedPct}%)`}
          bg="bg-red-50"
        />
      </div>

      {/* Trend chart */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Search Trend
          </CardTitle>
          <div className="flex gap-1">
            {["daily", "weekly"].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${view === v ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {v === "daily" ? "7 Days" : "14 Days"}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {trendData.every(d => d.count === 0) ? (
            <p className="text-center text-sm text-gray-400 py-8">No search data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top searches */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Search Terms</CardTitle>
          </CardHeader>
          <CardContent>
            {topTerms.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No searches recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topTerms} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="term" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Failed searches */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" /> Failed Searches (No Results)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {failedTerms.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No failed searches 🎉</p>
            ) : (
              <div className="space-y-2">
                {failedTerms.map(({ term, count }) => (
                  <div key={term} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700 capitalize">{term}</span>
                    <Badge variant="destructive" className="text-xs">{count}x</Badge>
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-3 pt-1">
                  Consider adding resources for these missing topics.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <Card className={`${bg} border-0`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
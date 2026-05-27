import { Bell, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

export default function AdminNotifications({ onOpenSection }) {
  const { notificationItems, unreadCount, markAsRead, markAllRead, isLoading } = useAdminNotifications();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay on top of system alerts, user activity, and moderation issues.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
            <Bell className="w-4 h-4" />
            {unreadCount} unread
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800">Notifications Inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-gray-500">Refreshing notifications…</div>
          ) : notificationItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No current alerts. Your system is running smoothly.
            </div>
          ) : (
            <div className="space-y-3">
              {notificationItems.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
                      <Badge variant={item.level === "high" ? "destructive" : "secondary"} className="text-xs uppercase">
                        {item.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={item.level === "high" ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() => {
                        markAsRead(item.id);
                        if (typeof onOpenSection === "function") onOpenSection(item.targetSection);
                      }}
                    >
                      {item.actionLabel}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

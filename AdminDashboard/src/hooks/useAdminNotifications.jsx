import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { getSeenNotificationIds, markNotificationsAsRead } from "@/lib/adminNotificationStorage";

export function useAdminNotifications() {
  const [seenIds, setSeenIds] = useState(() => getSeenNotificationIds());

  const { data: notificationItems = [], isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => apiClient.entities.AdminNotifications.list(),
    staleTime: 30_000,
  });

  const unreadCount = Array.isArray(notificationItems)
    ? notificationItems.filter((item) => !seenIds.includes(item.id)).length
    : 0;

  const markAsRead = (id) => {
    const next = markNotificationsAsRead([id]);
    setSeenIds(next);
    return next;
  };

  const markAllRead = () => {
    const ids = notificationItems.map((item) => item.id);
    const next = markNotificationsAsRead(ids);
    setSeenIds(next);
    return next;
  };

  return {
    notificationItems,
    unreadCount,
    seenIds,
    markAsRead,
    markAllRead,
    isLoading,
  };
}

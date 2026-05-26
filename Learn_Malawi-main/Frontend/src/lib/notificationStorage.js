const KEY = 'lm_seen_notification_ids';

export function getSeenNotificationIds() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function markNotificationsAsRead(ids) {
  try {
    const seen = getSeenNotificationIds();
    const merged = Array.from(new Set([...seen, ...ids]));
    localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {}
}

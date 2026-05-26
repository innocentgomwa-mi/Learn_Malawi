const STORAGE_KEY = 'admindashboard_seen_notifications';

export function getSeenNotificationIds() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function setSeenNotificationIds(ids = []) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function markNotificationsAsRead(ids = []) {
  const existing = getSeenNotificationIds();
  const merged = Array.from(new Set([...existing, ...ids]));
  setSeenNotificationIds(merged);
  return merged;
}

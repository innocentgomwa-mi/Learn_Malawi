const NOTIFICATION_STORAGE_KEY = 'learnmalawi_seen_notifications';

function safeParse(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function getUserStorageKey(userKey) {
  return `${NOTIFICATION_STORAGE_KEY}:${String(userKey || 'guest')}`;
}

export function getSeenNotificationIds(userKey) {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem(getUserStorageKey(userKey));
  return safeParse(stored);
}

export function markNotificationsAsRead(userKey, ids = []) {
  if (typeof window === 'undefined') return;
  const key = getUserStorageKey(userKey);
  const existing = getSeenNotificationIds(userKey);
  const updated = Array.from(new Set([...existing, ...ids.map(String)]));
  window.localStorage.setItem(key, JSON.stringify(updated));
}

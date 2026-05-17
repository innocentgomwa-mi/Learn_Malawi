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

const CHAT_NOTIFICATION_KEY = 'learnmalawi_seen_chat_messages';

function getChatStorageKey(userKey, room) {
  return `${CHAT_NOTIFICATION_KEY}:${String(userKey || 'guest')}:${room || 'general'}`;
}

export function getLastSeenChatMessageDate(userKey, room = 'general') {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(getChatStorageKey(userKey, room));
  if (!stored) return null;
  const timestamp = new Date(stored);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
}

export function markChatMessagesAsSeen(userKey, room = 'general', timestamp) {
  if (typeof window === 'undefined') return;
  const key = getChatStorageKey(userKey, room);
  const value = timestamp instanceof Date ? timestamp.toISOString() : String(timestamp || new Date().toISOString());
  window.localStorage.setItem(key, value);
}

const DISCUSSION_NOTIFICATION_KEY = 'learnmalawi_seen_discussions';

function getDiscussionStorageKey(userKey) {
  return `${DISCUSSION_NOTIFICATION_KEY}:${String(userKey || 'guest')}`;
}

export function getSeenDiscussionIds(userKey) {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem(getDiscussionStorageKey(userKey));
  return safeParse(stored);
}

export function markDiscussionThreadsAsRead(userKey, ids = []) {
  if (typeof window === 'undefined') return;
  const key = getDiscussionStorageKey(userKey);
  const existing = getSeenDiscussionIds(userKey);
  const updated = Array.from(new Set([...existing, ...ids.map(String)]));
  window.localStorage.setItem(key, JSON.stringify(updated));
}

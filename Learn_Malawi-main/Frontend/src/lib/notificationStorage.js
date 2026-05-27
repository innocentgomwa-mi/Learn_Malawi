const NOTIFICATION_STORAGE_KEY = 'learnmalawi_seen_notifications';
const CHAT_NOTIFICATION_KEY = 'learnmalawi_seen_chat_messages';
const DISCUSSION_NOTIFICATION_KEY = 'learnmalawi_seen_discussions';

function safeParse(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function normalizeRole(role) {
  return String(role || 'guest').toLowerCase();
}

function getUserStorageKey(userKey, role) {
  return `${NOTIFICATION_STORAGE_KEY}:${normalizeRole(role)}:${String(userKey || 'guest')}`;
}

function getUserLegacyStorageKey(userKey) {
  return `${NOTIFICATION_STORAGE_KEY}:${String(userKey || 'guest')}`;
}

export function getSeenNotificationIds(userKey, role) {
  if (typeof window === 'undefined') return [];

  const key = getUserStorageKey(userKey, role);
  const stored = window.localStorage.getItem(key);
  if (stored !== null) {
    return safeParse(stored);
  }

  const legacyStored = window.localStorage.getItem(getUserLegacyStorageKey(userKey));
  return safeParse(legacyStored);
}

export function markNotificationsAsRead(userKey, ids = [], role) {
  if (typeof window === 'undefined') return;
  const key = getUserStorageKey(userKey, role);
  const existing = getSeenNotificationIds(userKey, role);
  const updated = Array.from(new Set([...existing, ...ids.map(String)]));
  window.localStorage.setItem(key, JSON.stringify(updated));
}

function getChatStorageKey(userKey, room, role) {
  return `${CHAT_NOTIFICATION_KEY}:${normalizeRole(role)}:${String(userKey || 'guest')}:${room || 'general'}`;
}

function getChatLegacyStorageKey(userKey, room) {
  return `${CHAT_NOTIFICATION_KEY}:${String(userKey || 'guest')}:${room || 'general'}`;
}

export function getLastSeenChatMessageDate(userKey, room = 'general', role) {
  if (typeof window === 'undefined') return null;

  const key = getChatStorageKey(userKey, room, role);
  const stored = window.localStorage.getItem(key);
  if (stored !== null) {
    const timestamp = new Date(stored);
    return Number.isNaN(timestamp.getTime()) ? null : timestamp;
  }

  const legacyStored = window.localStorage.getItem(getChatLegacyStorageKey(userKey, room));
  if (!legacyStored) return null;
  const legacyTimestamp = new Date(legacyStored);
  return Number.isNaN(legacyTimestamp.getTime()) ? null : legacyTimestamp;
}

export function markChatMessagesAsSeen(userKey, room = 'general', timestamp, role) {
  if (typeof window === 'undefined') return;
  const key = getChatStorageKey(userKey, room, role);
  const value = timestamp instanceof Date ? timestamp.toISOString() : String(timestamp || new Date().toISOString());
  window.localStorage.setItem(key, value);
}

function getDiscussionStorageKey(userKey, role) {
  return `${DISCUSSION_NOTIFICATION_KEY}:${normalizeRole(role)}:${String(userKey || 'guest')}`;
}

function getDiscussionLegacyStorageKey(userKey) {
  return `${DISCUSSION_NOTIFICATION_KEY}:${String(userKey || 'guest')}`;
}

export function getSeenDiscussionIds(userKey, role) {
  if (typeof window === 'undefined') return [];

  const key = getDiscussionStorageKey(userKey, role);
  const stored = window.localStorage.getItem(key);
  if (stored !== null) {
    return safeParse(stored);
  }

  const legacyStored = window.localStorage.getItem(getDiscussionLegacyStorageKey(userKey));
  return safeParse(legacyStored);
}

export function markDiscussionThreadsAsRead(userKey, ids = [], role) {
  if (typeof window === 'undefined') return;
  const key = getDiscussionStorageKey(userKey, role);
  const existing = getSeenDiscussionIds(userKey, role);
  const updated = Array.from(new Set([...existing, ...ids.map(String)]));
  window.localStorage.setItem(key, JSON.stringify(updated));
}

/**
 * @typedef {{
 *   id: string,
 *   resource_id: string,
 *   completed: boolean,
 *   resource_type: string,
 *   resource_title: string,
 *   subject?: string,
 *   level?: string,
 *   [key: string]: any,
 * }} DashboardProgressEntry
 */

/**
 * @typedef {{
 *   id: string,
 *   quiz_id: string,
 *   quiz_title: string,
 *   subject?: string,
 *   level?: string,
 *   score: number,
 *   total_questions: number,
 *   correct_answers: number,
 *   completed_at: string,
 *   [key: string]: any,
 * }} DashboardAttemptEntry
 */

/**
 * @typedef {{
 *   progress: DashboardProgressEntry[],
 *   attempts: DashboardAttemptEntry[],
 * }} DashboardData
 */

const STORAGE_PREFIX = 'learnmalawi_dashboard_data';

/**
 * @param {string | null | undefined} userIdOrEmail
 * @returns {string | null}
 */
function getStorageKey(userIdOrEmail) {
  if (!userIdOrEmail) return null;
  return `${STORAGE_PREFIX}_${userIdOrEmail}`;
}

/**
 * @param {string | null} value
 * @returns {DashboardData | null}
 */
function safeParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * @param {string | null | undefined} userIdOrEmail
 * @returns {DashboardData}
 */
export function loadDashboardData(userIdOrEmail) {
  if (typeof window === 'undefined') {
    return { progress: [], attempts: [] };
  }

  const storageKey = getStorageKey(userIdOrEmail);
  if (!storageKey) {
    return { progress: [], attempts: [] };
  }

  const raw = window.localStorage.getItem(storageKey);
  const stored = safeParse(raw);

  if (!stored || typeof stored !== 'object') {
    return { progress: [], attempts: [] };
  }

  return {
    progress: Array.isArray(stored.progress) ? stored.progress : [],
    attempts: Array.isArray(stored.attempts) ? stored.attempts : [],
  };
}

/**
 * @param {string | null | undefined} userIdOrEmail
 * @param {DashboardData} data
 */
export function saveDashboardData(userIdOrEmail, data) {
  if (typeof window === 'undefined') return;
  const storageKey = getStorageKey(userIdOrEmail);
  if (!storageKey) return;
  window.localStorage.setItem(storageKey, JSON.stringify({
    progress: Array.isArray(data.progress) ? data.progress : [],
    attempts: Array.isArray(data.attempts) ? data.attempts : [],
  }));
}

/**
 * @param {string | null | undefined} userIdOrEmail
 * @returns {DashboardProgressEntry[]}
 */
export function loadUserProgress(userIdOrEmail) {
  return loadDashboardData(userIdOrEmail).progress;
}

/**
 * @param {string | null | undefined} userIdOrEmail
 * @param {DashboardProgressEntry[]} progress
 */
export function saveUserProgress(userIdOrEmail, progress) {
  const current = loadDashboardData(userIdOrEmail);
  saveDashboardData(userIdOrEmail, { ...current, progress: Array.isArray(progress) ? progress : [] });
}

/**
 * @param {string | null | undefined} userIdOrEmail
 * @param {DashboardAttemptEntry} attempt
 */
export function saveUserAttempt(userIdOrEmail, attempt) {
  if (!attempt) return;
  const current = loadDashboardData(userIdOrEmail);
  const nextAttempts = [attempt, ...(current.attempts || [])].slice(0, 50);
  saveDashboardData(userIdOrEmail, { ...current, attempts: nextAttempts });
}

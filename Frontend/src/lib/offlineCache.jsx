/**
 * Offline cache utility using localStorage.
 * Stores study notes and past papers so students can read them without internet.
 */

/**
 * @typedef {{
 *   id: string,
 *   title?: string,
 *   subject?: string,
 *   summary?: string,
 *   content?: string,
 *   level?: string,
 *   grade?: string,
 *   topic?: string,
 *   fileUrl?: string,
 *   imageUrl?: string,
 * }} OfflineStudyNote
 */

/**
 * @typedef {{
 *   id: string,
 *   title?: string,
 *   subject?: string,
 *   description?: string,
 *   year?: number,
 *   level?: string,
 *   paperUrl?: string,
 *   markingSchemeUrl?: string,
 * }} OfflinePastPaper
 */

const KEYS = {
  STUDY_NOTES: "offline_study_notes",
  PAST_PAPERS: "offline_past_papers",
  TIMESTAMP: "offline_cache_timestamp",
};

// ── Study Notes ──────────────────────────────────────────────────────────────

/** @returns {OfflineStudyNote[]} */
export function getSavedNotes() {
  try {
    return /** @type {OfflineStudyNote[]} */ (JSON.parse(localStorage.getItem(KEYS.STUDY_NOTES) || "[]"));
  } catch {
    return [];
  }
}

/** @param {OfflineStudyNote} note */
export function saveNoteOffline(note) {
  const existing = /** @type {OfflineStudyNote[]} */ (getSavedNotes());
  const filtered = existing.filter((n) => n.id !== note.id);
  const updated = [note, ...filtered];
  localStorage.setItem(KEYS.STUDY_NOTES, JSON.stringify(updated));
}

/** @param {string} noteId */
export function removeNoteOffline(noteId) {
  const updated = /** @type {OfflineStudyNote[]} */ (getSavedNotes()).filter((n) => n.id !== noteId);
  localStorage.setItem(KEYS.STUDY_NOTES, JSON.stringify(updated));
}

/** @param {string} noteId */
export function isNoteSaved(noteId) {
  return /** @type {OfflineStudyNote[]} */ (getSavedNotes()).some((n) => n.id === noteId);
}

// ── Past Papers ───────────────────────────────────────────────────────────────

/** @returns {OfflinePastPaper[]} */
export function getSavedPapers() {
  try {
    return /** @type {OfflinePastPaper[]} */ (JSON.parse(localStorage.getItem(KEYS.PAST_PAPERS) || "[]"));
  } catch {
    return [];
  }
}

/** @param {OfflinePastPaper} paper */
export function savePaperOffline(paper) {
  const existing = /** @type {OfflinePastPaper[]} */ (getSavedPapers());
  const filtered = existing.filter((p) => p.id !== paper.id);
  const updated = [paper, ...filtered];
  localStorage.setItem(KEYS.PAST_PAPERS, JSON.stringify(updated));
}

/** @param {string} paperId */
export function removePaperOffline(paperId) {
  const updated = /** @type {OfflinePastPaper[]} */ (getSavedPapers()).filter((p) => p.id !== paperId);
  localStorage.setItem(KEYS.PAST_PAPERS, JSON.stringify(updated));
}

/** @param {string} paperId */
export function isPaperSaved(paperId) {
  return /** @type {OfflinePastPaper[]} */ (getSavedPapers()).some((p) => p.id === paperId);
}

// ── Network status ────────────────────────────────────────────────────────────

export function isOnline() {
  return navigator.onLine;
}
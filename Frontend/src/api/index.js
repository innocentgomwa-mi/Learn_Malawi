/// <reference types="vite/client" />

/** @typedef {{ level?: string, subject?: string, search?: string }} StudyNotesParams */
/** @typedef {{ level?: string, subject?: string, difficulty?: string, classFilter?: string }} QuizzesParams */
/** @typedef {{ [key:string]: any }} JsonObject */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const ACCESS_TOKEN_KEY = 'learnmalawi_access_token';
const REFRESH_TOKEN_KEY = 'learnmalawi_refresh_token';

function getStoredAccessToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getStoredRefreshToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * @param {string} accessToken
 * @param {string} refreshToken
 */
function saveAuthTokens(accessToken, refreshToken) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * @param {Response} response
 */
async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * @param {any} body
 * @returns {any}
 */
function cleanRequestBody(body) {
  if (body === null || body === undefined) return body;
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      return JSON.stringify(cleanRequestBody(parsed));
    } catch {
      return body;
    }
  }
  if (Array.isArray(body)) {
    return body.map(cleanRequestBody);
  }
  if (typeof body === 'object') {
    const cleaned = /** @type {JsonObject} */ ({});
    Object.entries(body).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) return;
      cleaned[key] = cleanRequestBody(value);
    });
    return cleaned;
  }
  return body;
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function request(path, options = {}) {
  const headers = /** @type {Record<string, string>} */ ({
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  });

  const accessToken = getStoredAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const body = options.body;
  const requestBody = body && typeof body !== 'string' ? cleanRequestBody(body) : cleanRequestBody(body);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: typeof requestBody === 'object' ? JSON.stringify(requestBody) : requestBody,
  });

  if (response.ok) {
    return response.status === 204 ? null : parseJsonResponse(response);
  }

  if (response.status === 401 && path !== '/auth/refresh') {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          saveAuthTokens(refreshData.accessToken, refreshData.refreshToken);
          return request(path, options);
        }
      } catch (refreshError) {
        // fall through to error handling
      }
      clearAuthTokens();
    }
  }

  const message = await response.text();
  throw new Error(`API request failed (${response.status}): ${message}`);
}

/**
 * @param {string} email
 * @param {string} password
 */
export async function authLogin(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * @param {JsonObject} data
 */
export async function authRegister(data) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchProfile() {
  return request('/auth/profile');
}

/**
 * @param {JsonObject} data
 */
export function updateProfile(data) {
  return request('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) });
}

/**
 * @param {string} refreshToken
 */
export function authLogout(refreshToken) {
  return request('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

/**
 * @param {StudyNotesParams} [params]
 */
export function fetchStudyNotes({ level, subject, search } = {}) {
  const params = new URLSearchParams();
  if (level && level !== 'All') params.set('level', level);
  if (subject) params.set('subject', subject);
  if (search) params.set('search', search);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/study-notes${query}`);
}

export function fetchPastPapers() {
  return request('/past-papers').then((response) => {
    if (Array.isArray(response)) return response;
    return response?.data ?? [];
  });
}

export function fetchTutorials() {
  return request('/tutorials');
}

export function fetchCareerResources() {
  return request('/career-resources');
}

/**
 * @param {JsonObject} data
 */
export function createStudyNote(data) {
  return request('/study-notes', { method: 'POST', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 * @param {JsonObject} data
 */
export function updateStudyNote(id, data) {
  return request(`/study-notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 */
export function deleteStudyNote(id) {
  return request(`/study-notes/${id}`, { method: 'DELETE' });
}

/**
 * @param {JsonObject} data
 */
export function createTutorial(data) {
  return request('/tutorials', { method: 'POST', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 * @param {JsonObject} data
 */
export function updateTutorial(id, data) {
  return request(`/tutorials/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 */
export function deleteTutorial(id) {
  return request(`/tutorials/${id}`, { method: 'DELETE' });
}

/**
 * @param {JsonObject} data
 */
export function createCareerResource(data) {
  return request('/career-resources', { method: 'POST', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 * @param {JsonObject} data
 */
export function updateCareerResource(id, data) {
  return request(`/career-resources/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

/**
 * @param {{ teacherEmail?: string }} [params]
 */
export function fetchAnnouncements({ teacherEmail } = {}) {
  const params = new URLSearchParams();
  if (teacherEmail) params.set('teacher_email', teacherEmail);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/announcements${query}`);
}

/**
 * @param {JsonObject} data
 */
export function createAnnouncement(data) {
  return request('/announcements', { method: 'POST', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 * @param {JsonObject} data
 */
export function updateAnnouncement(id, data) {
  return request(`/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 */
export function deleteAnnouncement(id) {
  return request(`/announcements/${id}`, { method: 'DELETE' });
}

/**
 * @param {{ teacherEmail?: string }} [params]
 */
export function fetchDiscussions({ teacherEmail } = {}) {
  const params = new URLSearchParams();
  if (teacherEmail) params.set('teacher_email', teacherEmail);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/discussions${query}`);
}

/**
 * @param {JsonObject} data
 */
export function createDiscussion(data) {
  return request('/discussions', { method: 'POST', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 */
export function fetchDiscussion(id) {
  return request(`/discussions/${id}`);
}

/**
 * @param {string} id
 * @param {JsonObject} data
 */
export function updateDiscussion(id, data) {
  return request(`/discussions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 */
export function deleteDiscussion(id) {
  return request(`/discussions/${id}`, { method: 'DELETE' });
}

/**
 * @param {string} id
 * @param {JsonObject} data
 */
export function addDiscussionComment(id, data) {
  return request(`/discussions/${id}/comments`, { method: 'POST', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 */
export function deleteCareerResource(id) {
  return request(`/career-resources/${id}`, { method: 'DELETE' });
}

/**
 * @param {JsonObject} data
 */
export function createPastPaper(data) {
  return request('/past-papers', { method: 'POST', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 * @param {JsonObject} data
 */
export function updatePastPaper(id, data) {
  return request(`/past-papers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 */
export function deletePastPaper(id) {
  return request(`/past-papers/${id}`, { method: 'DELETE' });
}

/**
 * @param {JsonObject} data
 */
export function createQuiz(data) {
  return request('/quizzes', { method: 'POST', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 * @param {JsonObject} data
 */
export function updateQuiz(id, data) {
  return request(`/quizzes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

/**
 * @param {string} id
 */
export function deleteQuiz(id) {
  return request(`/quizzes/${id}`, { method: 'DELETE' });
}

/**
 * @param {QuizzesParams} [params]
 */
export function fetchQuizzes({ level, subject, difficulty, classFilter } = {}) {
  const params = new URLSearchParams();
  if (level && level !== 'All') params.set('level', level);
  if (subject) params.set('subject', subject);
  if (difficulty && difficulty !== 'All') params.set('difficulty', difficulty);
  if (classFilter) params.set('class', classFilter);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/quizzes${query}`);
}

export function fetchAttendanceRecords({ teacherEmail, course, date } = {}) {
  const params = new URLSearchParams();
  if (teacherEmail) params.set('teacher_email', teacherEmail);
  if (course) params.set('course', course);
  if (date) params.set('date', date);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/attendance${query}`);
}

export function fetchAttendanceHistory(teacherEmail) {
  return request(`/attendance?teacher_email=${encodeURIComponent(teacherEmail)}`);
}

export function createAttendance(data) {
  return request('/attendance', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAttendance(id, data) {
  return request(`/attendance/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

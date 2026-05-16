/// <reference types="vite/client" />

/** @typedef {{ level?: string, subject?: string, search?: string }} StudyNotesParams */
/** @typedef {{ level?: string, subject?: string, difficulty?: string, classFilter?: string }} QuizzesParams */
/** @typedef {{ [key:string]: any }} JsonObject */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const ACCESS_TOKEN_KEY = 'learnmalawi_access_token';
const REFRESH_TOKEN_KEY = 'learnmalawi_refresh_token';

function isValidToken(token) {
  return typeof token === 'string' && token.trim() !== '' && token.trim().toLowerCase() !== 'undefined' && token.trim().toLowerCase() !== 'null';
}

function getStoredAccessToken() {
  if (typeof window === 'undefined') return null;
  const token = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return isValidToken(token) ? token : null;
}

function getStoredRefreshToken() {
  if (typeof window === 'undefined') return null;
  const token = window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
  return isValidToken(token) ? token : null;
}

/**
 * @param {string} accessToken
 * @param {string} refreshToken
 */
function saveAuthTokens(accessToken, refreshToken) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}
function decodeJwtPayload(token) {
  if (!isValidToken(token)) return null;
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function isJwtTokenExpiringSoon(token, expiresWithinSeconds = 30) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 <= Date.now() + expiresWithinSeconds * 1000;
}

export async function refreshAuthTokens(refreshToken) {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const data = await parseJsonResponse(response);
    const message = data?.message || response.statusText;
    throw new Error(`Token refresh failed (${response.status}): ${message}`);
  }

  const responseData = await response.json();
  saveAuthTokens(responseData.accessToken, responseData.refreshToken);
  return responseData;
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
function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function cleanRequestBody(body) {
  if (body === null || body === undefined) return body;
  if (isFormData(body)) return body;
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

function pickFields(body, allowedFields) {
  if (typeof body !== 'object' || body === null) return {};
  const picked = {};
  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      picked[field] = body[field];
    }
  });
  return picked;
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function request(path, options = {}) {
  const headers = /** @type {Record<string, string>} */ ({
    ...(options.headers || {}),
  });

  const body = options.body;
  const isForm = isFormData(body);
  if (body !== undefined && body !== null && !headers['Content-Type'] && !headers['content-type'] && !isForm) {
    headers['Content-Type'] = 'application/json';
  }

  const accessToken = getStoredAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const requestBody = isForm ? body : body && typeof body !== 'string' ? cleanRequestBody(body) : cleanRequestBody(body);

  if (import.meta.env.DEV) {
    console.debug('API request', {
      path,
      method: options.method || 'GET',
      headers,
      body: requestBody,
    });
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: isForm ? requestBody : typeof requestBody === 'object' ? JSON.stringify(requestBody) : requestBody,
  });

  if (response.ok) {
    return response.status === 204 ? null : parseJsonResponse(response);
  }

  const errorData = await parseJsonResponse(response);
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

  let errorMessage = response.statusText;
  if (errorData) {
    if (typeof errorData === 'object') {
      errorMessage = errorData.message || JSON.stringify(errorData);
    } else {
      errorMessage = String(errorData);
    }
  }

  throw new Error(`API request failed (${response.status}): ${errorMessage}`);
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

export async function authVerifyEmail(data) {
  return request('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function authResendVerification(data) {
  return request('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function authForgotPassword(data) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function authResetPassword(data) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchProfile() {
  return request('/auth/profile');
}
export function fetchSystemSettings() {
  return request('/system-settings');
}
/**
 * @param {JsonObject} data
 */
export function updateProfile(data) {
  return request('/auth/profile', {
    method: 'PATCH',
    body: data,
  });
}

/**
 * @param {JsonObject} data
 */
export function logActivity(data) {
  return request('/activity-log', { method: 'POST', body: JSON.stringify(data) });
}

export function logSearch(data) {
  return request('/search-logs', { method: 'POST', body: JSON.stringify(data) });
}

export function fetchActivityLogs({ limit, action, level, subject } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (action) params.set('action', action);
  if (level) params.set('level', level);
  if (subject) params.set('subject', subject);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/activity-log${query}`);
}

export function fetchInsights({ level, subject, limit } = {}) {
  const params = new URLSearchParams();
  if (level) params.set('level', level);
  if (subject) params.set('subject', subject);
  if (limit) params.set('limit', String(limit));
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/insights${query}`);
}

const ACCESSIBILITY_SETTINGS_KEY = 'learnmalawi_accessibility_settings';

export async function fetchAccessibilitySettings() {
  if (typeof window === 'undefined') return {};
  const stored = window.localStorage.getItem(ACCESSIBILITY_SETTINGS_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export async function saveAccessibilitySettings(data) {
  if (typeof window === 'undefined') return data;
  try {
    window.localStorage.setItem(ACCESSIBILITY_SETTINGS_KEY, JSON.stringify(data));
  } catch {
    // ignore storage failures
  }
  return data;
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

export function authLogoutAll() {
  return request('/auth/logout-all', {
    method: 'POST',
  });
}

export function changePassword(currentPassword, newPassword) {
  return request('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function deleteAccount() {
  return request('/auth/account', {
    method: 'DELETE',
  });
}

/**
 * @param {StudyNotesParams} [params]
 */
export function fetchStudyNotes({ level, subject, search, teacherEmail } = {}) {
  const params = new URLSearchParams();
  if (level && level !== 'All') params.set('level', level);
  if (subject) params.set('subject', subject);
  if (search) params.set('search', search);
  if (teacherEmail) params.set('teacher_email', teacherEmail);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/study-notes${query}`);
}

export function fetchStudyGroups({ level, subject, teacherEmail } = {}) {
  const params = new URLSearchParams();
  if (level && level !== 'All') params.set('level', level);
  if (subject) params.set('subject', subject);
  if (teacherEmail) params.set('mentor_email', teacherEmail);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/study-groups${query}`);
}

export function fetchLearningPaths({ level, subject, teacherEmail, search } = {}) {
  const params = new URLSearchParams();
  if (level && level !== 'All') params.set('level', level);
  if (subject) params.set('subject', subject);
  if (teacherEmail) params.set('teacher_email', teacherEmail);
  if (search) params.set('search', search);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/learning-paths${query}`);
}

export function fetchLearningPath(id) {
  return request(`/learning-paths/${id}`);
}

const learningPathPayloadFields = ['title', 'subject', 'level', 'description', 'milestones'];

export function createLearningPath(data) {
  const payload = pickFields(data, learningPathPayloadFields);
  return request('/learning-paths', { method: 'POST', body: payload });
}

export function updateLearningPath(id, data) {
  const payload = pickFields(data, learningPathPayloadFields);
  return request(`/learning-paths/${id}`, { method: 'PATCH', body: payload });
}

export function deleteLearningPath(id) {
  return request(`/learning-paths/${id}`, { method: 'DELETE' });
}

export function fetchStudyBlocks() {
  return request('/study-blocks');
}

export function createStudyBlock(data) {
  const payload = pickFields(data, ['title', 'day_of_week', 'start_time', 'end_time', 'subject', 'color', 'resource_ids', 'notes']);
  return request('/study-blocks', { method: 'POST', body: payload });
}

export function updateStudyBlock(id, data) {
  const payload = pickFields(data, ['title', 'day_of_week', 'start_time', 'end_time', 'subject', 'color', 'resource_ids', 'notes']);
  return request(`/study-blocks/${id}`, { method: 'PATCH', body: payload });
}

export function deleteStudyBlock(id) {
  return request(`/study-blocks/${id}`, { method: 'DELETE' });
}

export function fetchResources() {
  return request('/resources');
}

export function createResource(data) {
  const payload = pickFields(data, ['name', 'type', 'subject', 'url']);
  return request('/resources', { method: 'POST', body: payload });
}

export function updateResource(id, data) {
  const payload = pickFields(data, ['name', 'type', 'subject', 'url']);
  return request(`/resources/${id}`, { method: 'PATCH', body: payload });
}

export function deleteResource(id) {
  return request(`/resources/${id}`, { method: 'DELETE' });
}

export function fetchExams() {
  return request('/exams');
}

export function createExam(data) {
  const payload = pickFields(data, ['title', 'subject', 'exam_date', 'location', 'notify_days_before', 'notes', 'color']);
  return request('/exams', { method: 'POST', body: payload });
}

export function updateExam(id, data) {
  const payload = pickFields(data, ['title', 'subject', 'exam_date', 'location', 'notify_days_before', 'notes', 'color']);
  return request(`/exams/${id}`, { method: 'PATCH', body: payload });
}

export function deleteExam(id) {
  return request(`/exams/${id}`, { method: 'DELETE' });
}

export function fetchClassSchedules() {
  return request('/class-schedules');
}

export function createClassSchedule(data) {
  return request('/class-schedules', { method: 'POST', body: JSON.stringify(data) });
}

export function updateClassSchedule(id, data) {
  return request(`/class-schedules/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteClassSchedule(id) {
  return request(`/class-schedules/${id}`, { method: 'DELETE' });
}

export function fetchChatMessages({ room } = {}) {
  const params = new URLSearchParams();
  if (room) params.set('room', room);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/chat-messages${query}`);
}

export function createChatMessage(data) {
  return request('/chat-messages', { method: 'POST', body: JSON.stringify(data) });
}

export function updateChatMessage(id, data) {
  return request(`/chat-messages/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteChatMessage(id) {
  return request(`/chat-messages/${id}`, { method: 'DELETE' });
}

export function fetchTeachers() {
  return request('/users/teachers');
}

export function fetchSharedResources({ search, resourceType } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (resourceType && resourceType !== 'all') params.set('resource_type', resourceType);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/shared-resources${query}`);
}

export function createSharedResource(data) {
  return request('/shared-resources', { method: 'POST', body: JSON.stringify(data) });
}

export function updateSharedResource(id, data) {
  return request(`/shared-resources/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteSharedResource(id) {
  return request(`/shared-resources/${id}`, { method: 'DELETE' });
}

export function uploadSharedResourceFile(formData) {
  return request('/shared-resources/upload', { method: 'POST', body: formData });
}

export function fetchStudyGroupMessages({ groupId } = {}) {
  const params = new URLSearchParams();
  if (groupId) params.set('group_id', groupId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/study-group-messages${query}`);
}

export function createStudyGroupMessage(data) {
  return request('/study-group-messages', { method: 'POST', body: JSON.stringify(data) });
}

export function updateStudyGroup(id, data) {
  return request(`/study-groups/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteStudyGroup(id) {
  return request(`/study-groups/${id}`, { method: 'DELETE' });
}

export function createStudyGroup(data) {
  return request('/study-groups', { method: 'POST', body: JSON.stringify(data) });
}

export function fetchPastPapers({ teacherEmail, level, subject, year, search, page, limit } = {}) {
  const params = new URLSearchParams();
  if (teacherEmail) params.set('teacher_email', teacherEmail);
  if (level) params.set('level', level);
  if (subject) params.set('subject', subject);
  if (year) params.set('year', String(year));
  if (search) params.set('search', search);
  if (page) params.set('page', String(page));
  if (limit) params.set('limit', String(limit));
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/past-papers${query}`).then((response) => {
    if (Array.isArray(response)) return response;
    return response?.data ?? [];
  });
}

export function fetchTutorials({ teacherEmail, level, subject, classFilter } = {}) {
  const params = new URLSearchParams();
  if (teacherEmail) params.set('teacher_email', teacherEmail);
  if (level) params.set('level', level);
  if (subject) params.set('subject', subject);
  if (classFilter) params.set('class', classFilter);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/tutorials${query}`);
}

export function fetchStudentProgress({ studentEmail, entryType } = {}) {
  const params = new URLSearchParams();
  if (studentEmail) params.set('student_email', studentEmail);
  if (entryType) params.set('entry_type', entryType);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/student-progress${query}`);
}

export function recordStudentProgress(data) {
  return request('/student-progress', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchCareerResources() {
  return request('/career-resources');
}

export function fetchAiChat(prompt) {
  return request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

export function generateStudyNoteQuiz(note) {
  return request('/ai/quiz', {
    method: 'POST',
    body: JSON.stringify({
      title: note.title,
      subject: note.subject,
      level: note.level,
      topic: note.topic,
      content: note.content,
      summary: note.summary,
    }),
  });
}

/**
 * @param {JsonObject} data
 */
export function createStudyNote(data) {
  return request('/study-notes', {
    method: 'POST',
    body: isFormData(data) ? data : JSON.stringify(data),
  });
}

/**
 * @param {string} id
 * @param {JsonObject|FormData} data
 */
export function updateStudyNote(id, data) {
  return request(`/study-notes/${id}`, {
    method: 'PATCH',
    body: isFormData(data) ? data : JSON.stringify(data),
  });
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
  return request('/tutorials', { method: 'POST', body: isFormData(data) ? data : JSON.stringify(data) });
}

/**
 * @param {string} id
 * @param {JsonObject|FormData} data
 */
export function updateTutorial(id, data) {
  return request(`/tutorials/${id}`, { method: 'PATCH', body: isFormData(data) ? data : JSON.stringify(data) });
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
 * @param {{ teacherEmail?: string, published?: boolean }} [params]
 */
export function fetchAnnouncements({ teacherEmail, published } = {}) {
  const params = new URLSearchParams();
  if (teacherEmail) params.set('teacher_email', teacherEmail);
  if (published !== undefined) params.set('published', published ? 'true' : 'false');
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
  return request('/past-papers', { method: 'POST', body: isFormData(data) ? data : JSON.stringify(data) });
}

/**
 * @param {string} id
 * @param {JsonObject|FormData} data
 */
export function updatePastPaper(id, data) {
  return request(`/past-papers/${id}`, { method: 'PATCH', body: isFormData(data) ? data : JSON.stringify(data) });
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
export function fetchQuizzes({ level, subject, difficulty, classFilter, teacherEmail } = {}) {
  const params = new URLSearchParams();
  if (level && level !== 'All') params.set('level', level);
  if (subject) params.set('subject', subject);
  if (difficulty && difficulty !== 'All') params.set('difficulty', difficulty);
  if (classFilter) params.set('class', classFilter);
  if (teacherEmail) params.set('teacher_email', teacherEmail);
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

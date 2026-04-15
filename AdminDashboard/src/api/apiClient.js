const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_TOKEN_KEY = 'admindashboard_access_token';
const REFRESH_TOKEN_KEY = 'admindashboard_refresh_token';

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

const hasAuthToken = () => Boolean(getAuthToken());

const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

const setRefreshToken = (refreshToken) => {
  if (typeof window === 'undefined') return;
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

const clearTokens = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const buildHeaders = (extraHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const fetchJson = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  const { body, headers, ...rest } = options;
  const response = await fetch(url, {
    headers: buildHeaders(headers),
    body: body && typeof body === 'object' ? JSON.stringify(body) : body,
    credentials: 'include',
    ...rest,
  });

  const raw = await response.text();
  const data = raw ? safeJsonParse(raw) : null;
  if (!response.ok) {
    const error = new Error(data?.message || response.statusText || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

const tryFetchJson = async (endpoint, fallback = null, options = {}) => {
  try {
    return await fetchJson(endpoint, options);
  } catch (error) {
    console.warn(`Local API fallback for ${endpoint}:`, error.message || error);
    return fallback;
  }
};

const buildEntity = (basePath) => ({
  list: async () => {
    if (!hasAuthToken()) return [];
    return tryFetchJson(basePath, []);
  },
  filter: async () => {
    if (!hasAuthToken()) return [];
    return tryFetchJson(basePath, []);
  },
  create: async (data) => {
    if (!hasAuthToken()) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }
    return tryFetchJson(basePath, {}, { method: 'POST', body: data });
  },
  update: async (id, data) => {
    if (!hasAuthToken()) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }
    return tryFetchJson(`${basePath}/${id}`, {}, { method: 'PATCH', body: data });
  },
  delete: async (id) => {
    if (!hasAuthToken()) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }
    return tryFetchJson(`${basePath}/${id}`, {}, { method: 'DELETE' });
  },
});

const User = {
  list: async () => fetchJson('/users'),
  create: async (data) => fetchJson('/users', { method: 'POST', body: data }),
  update: async (id, data) => fetchJson(`/users/${id}`, { method: 'PATCH', body: data }),
  delete: async (id) => fetchJson(`/users/${id}`, { method: 'DELETE' }),
};

const Teacher = {
  list: async () => {
    const teachers = (await User.list()).filter((user) => user?.role === 'Teacher');
    return teachers.map((teacher) => ({
      ...teacher,
      full_name: teacher.full_name || [teacher.firstName, teacher.lastName].filter(Boolean).join(' '),
    }));
  },
  create: async (data) => User.create({ ...data, role: 'Teacher' }),
  update: User.update,
  delete: User.delete,
};

const Student = {
  list: async () => (await User.list()).filter((user) => user?.role === 'Student'),
  create: async (data) => User.create({ ...data, role: 'Student' }),
  update: User.update,
  delete: User.delete,
};

const Announcement = {
  list: async () => fetchJson('/announcements'),
  create: async (data) => fetchJson('/announcements', { method: 'POST', body: data }),
  update: async (id, data) => fetchJson(`/announcements/${id}`, { method: 'PATCH', body: data }),
  delete: async (id) => fetchJson(`/announcements/${id}`, { method: 'DELETE' }),
};

const TeacherPost = {
  list: async () => tryFetchJson('/teacher-posts', []),
  filter: async () => tryFetchJson('/teacher-posts', []),
  create: async (data) => tryFetchJson('/teacher-posts', data, { method: 'POST', body: data }),
  update: async (id, data) => tryFetchJson(`/teacher-posts/${id}`, data, { method: 'PATCH', body: data }),
  delete: async (id) => tryFetchJson(`/teacher-posts/${id}`, {}, { method: 'DELETE' }),
};

const ResourceRating = buildEntity('/resource-ratings');
const SystemSettings = buildEntity('/system-settings');
const DataChangeHistory = buildEntity('/data-change-history');
const StudentProgress = buildEntity('/student-progress');
const ActivityLog = buildEntity('/activity-log');

const auth = {
  me: async () => fetchJson('/auth/profile'),
  login: async (email, password) => {
    const data = await fetchJson('/auth/login', { method: 'POST', body: { email, password } });
    if (data?.accessToken) {
      setAuthToken(data.accessToken);
    }
    if (data?.refreshToken) {
      setRefreshToken(data.refreshToken);
    }
    return data;
  },
  refresh: async () => {
    const refreshToken = typeof window !== 'undefined' ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;
    if (!refreshToken) {
      const error = new Error('Refresh token not available');
      error.status = 401;
      throw error;
    }
    const data = await fetchJson('/auth/refresh', { method: 'POST', body: { refreshToken } });
    if (data?.accessToken) {
      setAuthToken(data.accessToken);
    }
    if (data?.refreshToken) {
      setRefreshToken(data.refreshToken);
    }
    return data;
  },
  logout: async (redirectUrl) => {
    const refreshToken = typeof window !== 'undefined' ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;
    if (refreshToken) {
      await tryFetchJson('/auth/logout', {}, { method: 'POST', body: { refreshToken } });
    }
    clearTokens();
    if (redirectUrl && typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  },
  redirectToLogin: (redirectUrl) => {
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl || '/';
    }
  },
};

export const apiClient = {
  auth,
  hasAuthToken,
  entities: {
    User,
    Teacher,
    Student,
    Announcement,
    TeacherPost,
    ResourceRating,
    SystemSettings,
    DataChangeHistory,
    StudentProgress,
    ActivityLog,
  },
};


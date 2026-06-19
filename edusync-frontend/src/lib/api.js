import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edusync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('edusync_token');
      localStorage.removeItem('edusync_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════
// Auth API
// ═══════════════════════════════════════════
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ═══════════════════════════════════════════
// School API
// ═══════════════════════════════════════════
export const schoolAPI = {
  create: (data) => api.post('/schools', data),
  getMy: () => api.get('/schools/me'),
  getMine: () => api.get('/schools/me'),
  inviteTeacher: (data) => api.post('/schools/teachers/invite', data),
  getStudents: () => api.get('/schools/students'),
  join: (data) => api.post('/schools/join', data),
};

// ═══════════════════════════════════════════
// Course API
// ═══════════════════════════════════════════
export const courseAPI = {
  create: (data) => api.post('/courses', data),
  getAll: () => api.get('/courses'),
  getMy: () => api.get('/courses/my'),
  getById: (id) => api.get(`/courses/${id}`),
  updatePrompt: (id, data) => api.patch(`/courses/${id}/prompt`, data),
};

// ═══════════════════════════════════════════
// Lesson API
// ═══════════════════════════════════════════
export const lessonAPI = {
  create: (courseId, formData) =>
    api.post(`/courses/${courseId}/lessons`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getByCourse: (courseId) => api.get(`/courses/${courseId}/lessons`),
  getById: (id) => api.get(`/lessons/${id}`),
};

// ═══════════════════════════════════════════
// Enrollment API
// ═══════════════════════════════════════════
export const enrollmentAPI = {
  request: (courseId) => api.post(`/courses/${courseId}/enroll`),
  getByCourse: (courseId) => api.get(`/courses/${courseId}/enrollments`),
  approve: (enrollmentId) => api.patch(`/enrollments/${enrollmentId}/approve`),
  reject: (enrollmentId) => api.patch(`/enrollments/${enrollmentId}/reject`),
  myCourses: () => api.get('/students/my-courses'),
  joinWithCode: (data) => api.post('/courses/join', data),
};

// ═══════════════════════════════════════════
// Homework API
// ═══════════════════════════════════════════
export const homeworkAPI = {
  create: (courseId, data) => api.post(`/courses/${courseId}/homework`, data),
  getByCourse: (courseId) => api.get(`/courses/${courseId}/homework`),
  submit: (homeworkId, formData) =>
    api.post(`/homework/${homeworkId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getSubmissions: (homeworkId) => api.get(`/homework/${homeworkId}/submissions`),
};

// ═══════════════════════════════════════════
// Chat API
// ═══════════════════════════════════════════
export const chatAPI = {
  send: (courseId, data) => api.post(`/courses/${courseId}/chat`, data),
};

export default api;

import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, Promise.reject)

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const msg = error.response?.data?.message
    const code = error.response?.data?.code
    if (error.response?.status === 401) {
      if (code === 'TOKEN_EXPIRED') {
        // Try refresh
        const refreshToken = localStorage.getItem('sf_refresh')
        if (refreshToken) {
          try {
            const res = await axios.post('/api/auth/refresh-token', { refreshToken })
            localStorage.setItem('sf_token', res.data.token)
            error.config.headers.Authorization = `Bearer ${res.data.token}`
            return api.request(error.config)
          } catch { /* fall through to logout */ }
        }
      }
      localStorage.removeItem('sf_token')
      localStorage.removeItem('sf_refresh')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  changePassword: (d) => api.put('/auth/change-password', d),
}

export const tasksApi = {
  getAll: (p) => api.get('/tasks', { params: p }),
  create: (d) => api.post('/tasks', d),
  update: (id, d) => api.put(`/tasks/${id}`, d),
  delete: (id) => api.delete(`/tasks/${id}`),
  getOne: (id) => api.get(`/tasks/${id}`),
}

export const notesApi = {
  getAll: (p) => api.get('/notes', { params: p }),
  create: (d) => api.post('/notes', d),
  update: (id, d) => api.put(`/notes/${id}`, d),
  delete: (id) => api.delete(`/notes/${id}`),
}

export const studyApi = {
  getAll: (p) => api.get('/study-sessions', { params: p }),
  create: (d) => api.post('/study-sessions', d),
  update: (id, d) => api.put(`/study-sessions/${id}`, d),
  delete: (id) => api.delete(`/study-sessions/${id}`),
  getWeeklyGoals: () => api.get('/study-sessions/weekly-goals'),
}

export const analyticsApi = { get: () => api.get('/analytics') }

export const notifApi = {
  getAll: () => api.get('/notifications'),
  markRead: () => api.put('/notifications/mark-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
}

export const profileApi = { update: (d) => api.put('/profile', d) }

export const achievementsApi = { getAll: () => api.get('/achievements') }

export const facultyApi = {
  getStudents: (p) => api.get('/faculty/students', { params: p }),
  getStudent: (id) => api.get(`/faculty/students/${id}`),
  getAnalytics: () => api.get('/faculty/analytics'),
  assignStudent: (studentId) => api.post('/faculty/assign-student', { studentId }),
  messageStudent: (studentId, message) => api.post('/faculty/message-student', { studentId, message }),
}

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (p) => api.get('/admin/users', { params: p }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, d) => api.put(`/admin/users/${id}`, d),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createFaculty: (d) => api.post('/admin/faculty', d),
  getAuditLogs: (p) => api.get('/admin/audit-logs', { params: p }),
  getSystemStats: () => api.get('/admin/system-stats'),
  broadcast: (d) => api.post('/admin/broadcast', d),
}

export default api

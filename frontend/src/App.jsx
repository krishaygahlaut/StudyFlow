import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import LoadingScreen from './components/ui/LoadingScreen'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'

// Student pages
import DashboardPage from './pages/student/DashboardPage'
import TasksPage from './pages/student/TasksPage'
import CalendarPage from './pages/student/CalendarPage'
import NotesPage from './pages/student/NotesPage'
import AnalyticsPage from './pages/student/AnalyticsPage'
import StudyPlannerPage from './pages/student/StudyPlannerPage'
import AchievementsPage from './pages/student/AchievementsPage'
import ProfilePage from './pages/student/ProfilePage'

// Faculty pages
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import FacultyStudents from './pages/faculty/FacultyStudents'
import FacultyStudentDetail from './pages/faculty/FacultyStudentDetail'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'

import NotFoundPage from './pages/NotFoundPage'

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'faculty') return <Navigate to="/faculty" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Student */}
      <Route path="/" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="planner" element={<StudyPlannerPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Faculty */}
      <Route path="/faculty" element={<ProtectedRoute roles={['faculty', 'admin']}><Layout /></ProtectedRoute>}>
        <Route index element={<FacultyDashboard />} />
        <Route path="students" element={<FacultyStudents />} />
        <Route path="students/:id" element={<FacultyStudentDetail />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

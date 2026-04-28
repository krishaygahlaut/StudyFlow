import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('sf_token')
    if (!token) { setLoading(false); setInitialized(true); return }
    authApi.getMe()
      .then(res => setUser(res.data.user))
      .catch(() => { localStorage.removeItem('sf_token'); localStorage.removeItem('sf_refresh') })
      .finally(() => { setLoading(false); setInitialized(true) })
  }, [])

  const register = async (data) => {
    const res = await authApi.register(data)
    localStorage.setItem('sf_token', res.data.token)
    if (res.data.refreshToken) localStorage.setItem('sf_refresh', res.data.refreshToken)
    setUser(res.data.user)
    toast.success(`Welcome to StudyFlow, ${res.data.user.name}! 🚀`)
    return res.data
  }

  const login = async (data) => {
    const res = await authApi.login(data)
    localStorage.setItem('sf_token', res.data.token)
    if (res.data.refreshToken) localStorage.setItem('sf_refresh', res.data.refreshToken)
    setUser(res.data.user)
    toast.success(`Welcome back, ${res.data.user.name}! 👋`)
    return res.data
  }

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch {}
    localStorage.removeItem('sf_token')
    localStorage.removeItem('sf_refresh')
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const updateUser = useCallback((updates) => setUser(prev => ({ ...prev, ...updates })), [])

  const isStudent = user?.role === 'student'
  const isFaculty = user?.role === 'faculty'
  const isAdmin = user?.role === 'admin'
  const canAccessFaculty = user?.role === 'faculty' || user?.role === 'admin'
  const canAccessAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, initialized, register, login, logout, updateUser, isStudent, isFaculty, isAdmin, canAccessFaculty, canAccessAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CheckSquare, Calendar, StickyNote, BarChart2, BookOpen, Trophy, User, Bell, LogOut, Menu, X, Zap, ChevronRight, Users, Shield, FileText, GraduationCap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { notifApi } from '../../services/api'
import NotificationPanel from '../ui/NotificationPanel'
import FloatingTimer from '../ui/FloatingTimer'

const studentNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
  { to: '/planner', icon: BookOpen, label: 'Study Planner' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const facultyNav = [
  { to: '/faculty', icon: LayoutDashboard, label: 'Overview' },
  { to: '/faculty/students', icon: Users, label: 'My Students' },
]

const adminNav = [
  { to: '/admin', icon: Shield, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
]

const roleColors = { student: 'from-purple-500 to-blue-500', faculty: 'from-cyan-500 to-emerald-500', admin: 'from-red-500 to-orange-500' }
const roleLabels = { student: 'Student', faculty: 'Faculty', admin: 'Administrator' }

export default function Layout() {
  const { user, logout, isAdmin, isFaculty } = useAuth()
  const [open, setOpen] = useState(true)
  const [showNotif, setShowNotif] = useState(false)
  const [unread, setUnread] = useState(0)
  const location = useLocation()

  const nav = isAdmin ? adminNav : isFaculty ? facultyNav : studentNav
  const xpProgress = user ? Math.min(((user.xp || 0) % 100), 100) : 0

  useEffect(() => {
    notifApi.getAll().then(r => setUnread(r.data.unreadCount || 0)).catch(() => {})
    const iv = setInterval(() => notifApi.getAll().then(r => setUnread(r.data.unreadCount || 0)).catch(() => {}), 30000)
    return () => clearInterval(iv)
  }, [])

  const pageTitle = [...studentNav, ...facultyNav, ...adminNav].find(n => location.pathname === n.to || location.pathname.startsWith(n.to + '/'))?.label || 'StudyFlow Pro'

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="fixed lg:relative z-30 h-full glass-dark border-r border-white/5 flex flex-col flex-shrink-0"
        animate={{ width: open ? 248 : 64 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 flex-shrink-0">
          <motion.div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${roleColors[user?.role || 'student']}`} whileHover={{ rotate: 15, scale: 1.1 }}>
            <Zap size={16} className="text-white" />
          </motion.div>
          <AnimatePresence>
            {open && (
              <motion.div className="flex-1 overflow-hidden" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <p className="font-display font-bold text-white text-sm leading-tight">StudyFlow Pro</p>
                <p className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.35)' }}>{roleLabels[user?.role || 'student']}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button className="text-white/30 hover:text-white transition-colors flex-shrink-0 ml-auto" onClick={() => setOpen(!open)}>
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* XP bar (students only) */}
        <AnimatePresence>
          {open && user?.role === 'student' && (
            <motion.div className="mx-3 mt-3 p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.12)' }} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-display bg-gradient-to-br ${roleColors.student} flex-shrink-0`}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-display font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-purple-400 font-body">Lv.{user?.level} · {user?.xp} XP</p>
                </div>
              </div>
              <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/faculty' || to === '/admin'}>
              {({ isActive }) => (
                <motion.div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${isActive ? 'text-white' : 'text-white/35 hover:text-white/70 hover:bg-white/4'}`}
                  style={isActive ? { background: 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(59,130,246,0.10))', border: '1px solid rgba(168,85,247,0.25)' } : {}}
                  whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                >
                  <Icon size={17} className={`flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                  <AnimatePresence>
                    {open && (
                      <motion.span className="font-body text-sm font-medium whitespace-nowrap flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && open && <ChevronRight size={13} className="text-purple-400 flex-shrink-0" />}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-white/5 flex-shrink-0">
          <motion.button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-400/8 transition-all w-full" whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
            <LogOut size={17} className="flex-shrink-0" />
            <AnimatePresence>
              {open && <motion.span className="font-body text-sm font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Sign Out</motion.span>}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-white/5 glass-dark flex-shrink-0">
          <div>
            <h1 className="font-display text-base font-bold text-white">{pageTitle}</h1>
            <p className="text-xs text-white/25 font-body">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2">
            {user?.streak > 0 && (
              <motion.div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }} animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <span>🔥</span><span className="text-amber-400">{user.streak}d</span>
              </motion.div>
            )}
            <motion.button className="relative btn-icon" onClick={() => setShowNotif(!showNotif)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Bell size={17} />
              {unread > 0 && (
                <motion.span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold font-display" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  {unread > 9 ? '9+' : unread}
                </motion.span>
              )}
            </motion.button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showNotif && <NotificationPanel onClose={() => { setShowNotif(false); setUnread(0) }} />}
      </AnimatePresence>

      {user?.role === 'student' && <FloatingTimer />}
    </div>
  )
}

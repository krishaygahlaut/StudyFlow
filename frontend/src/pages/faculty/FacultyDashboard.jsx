import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { facultyApi } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { StatCard, GridSkeleton } from '../../components/ui/index'

const tooltipStyle = { contentStyle: { background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 12, fontFamily: 'DM Sans', fontSize: 12, color: '#fff' } }
const COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']

export default function FacultyDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    facultyApi.getAnalytics().then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <GridSkeleton cols={4} height={28} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card h-72 animate-pulse" />
        <div className="glass-card h-72 animate-pulse" />
      </div>
    </div>
  )

  const o = data?.overview || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div className="glass-card p-6 relative overflow-hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)' }}>👨‍🏫</div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]}!</h2>
            <p className="text-white/40 text-sm font-body mt-0.5">{user?.designation} · {user?.department}</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-6 text-center">
            <div><p className="font-display text-2xl font-bold text-cyan-400">{o.totalStudents || 0}</p><p className="text-xs text-white/25 font-body">Students</p></div>
            <div><p className="font-display text-2xl font-bold text-emerald-400">{o.avgCompletionRate || 0}%</p><p className="text-xs text-white/25 font-body">Avg. Completion</p></div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={o.totalStudents || 0} icon="👥" gradient="linear-gradient(135deg, #06b6d4, #3b82f6)" delay={0.05} />
        <StatCard title="Tasks Assigned" value={o.totalTasks || 0} icon="📋" gradient="linear-gradient(135deg, #a855f7, #3b82f6)" delay={0.1} />
        <StatCard title="Avg Completion" value={`${o.avgCompletionRate || 0}%`} icon="✅" gradient="linear-gradient(135deg, #10b981, #06b6d4)" delay={0.15} />
        <StatCard title="Overdue Tasks" value={o.overdueTasks || 0} icon="⚠️" gradient="linear-gradient(135deg, #ef4444, #f97316)" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top performers */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-display font-semibold text-white text-sm">Top Performers</h3><p className="text-xs text-white/30 font-body">By completion rate</p></div>
            <Star size={15} className="text-amber-400" />
          </div>
          <div className="space-y-3">
            {(data?.topPerformers || []).map((s, i) => (
              <Link to={`/faculty/students/${s.id}`} key={s.id}>
                <motion.div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/4 transition-colors" whileHover={{ x: 2 }}>
                  <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-white font-display flex-shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-body truncate">{s.name}</p>
                    <p className="text-xs text-white/30 font-body">{s.completed}/{s.total} tasks</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold font-display text-emerald-400">{s.rate}%</p>
                  </div>
                  <div className="w-16 h-1.5 rounded-full bg-white/8 overflow-hidden flex-shrink-0">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${s.rate}%` }} />
                  </div>
                </motion.div>
              </Link>
            ))}
            {(data?.topPerformers?.length || 0) === 0 && <p className="text-center text-white/25 text-sm font-body py-4">No data yet</p>}
          </div>
        </motion.div>

        {/* At-risk students */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-display font-semibold text-white text-sm">Needs Attention</h3><p className="text-xs text-white/30 font-body">Low completion or overdue</p></div>
            <AlertTriangle size={15} className="text-red-400" />
          </div>
          <div className="space-y-3">
            {(data?.atRisk || []).map((s) => (
              <Link to={`/faculty/students/${s.id}`} key={s.id}>
                <motion.div className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-400/5 border border-transparent hover:border-red-400/15 transition-all" whileHover={{ x: 2 }}>
                  <div className="w-8 h-8 rounded-xl bg-red-400/15 flex items-center justify-center flex-shrink-0"><AlertTriangle size={14} className="text-red-400" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-body truncate">{s.name}</p>
                    <p className="text-xs text-white/30 font-body">{s.completed}/{s.total} tasks · {s.rate}% rate</p>
                  </div>
                  <ArrowRight size={13} className="text-white/20 flex-shrink-0" />
                </motion.div>
              </Link>
            ))}
            {(data?.atRisk?.length || 0) === 0 && (
              <div className="text-center py-6">
                <CheckCircle size={24} className="mx-auto mb-2 text-emerald-400" />
                <p className="text-white/30 text-sm font-body">All students on track!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Subject distribution */}
      {(data?.topSubjects?.length || 0) > 0 && (
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 className="font-display font-semibold text-white text-sm mb-4">Task Distribution by Subject</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.topSubjects} layout="vertical">
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="subject" type="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Tasks">
                  {data.topSubjects.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {data.topSubjects.map((s, i) => (
                <div key={s.subject} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-white/60 font-body flex-1 truncate">{s.subject}</span>
                  <span className="text-sm font-bold font-display text-white">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-end">
        <Link to="/faculty/students" className="btn-primary text-sm">
          <Users size={15} />View All Students
        </Link>
      </div>
    </div>
  )
}

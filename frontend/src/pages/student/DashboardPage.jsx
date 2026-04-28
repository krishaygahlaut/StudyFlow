import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import { analyticsApi, tasksApi } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { StatCard, GridSkeleton } from '../../components/ui/index'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

const quotes = [
  "Every task completed is a step closer to your goals. 🌟",
  "Small consistent progress beats occasional perfection. 💪",
  "The secret to getting ahead is getting started. 🚀",
  "Your future self will thank you for today's effort. 🎯",
  "Focus on progress, not perfection. Keep going! ✨",
]

const priorityColors = { low: '#10b981', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' }

function getDueLabel(date) {
  const d = new Date(date)
  if (isPast(d) && !isToday(d)) return { label: 'Overdue', color: 'text-red-400' }
  if (isToday(d)) return { label: 'Today', color: 'text-amber-400' }
  if (isTomorrow(d)) return { label: 'Tomorrow', color: 'text-orange-400' }
  return { label: format(d, 'MMM d'), color: 'text-white/35' }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [quote] = useState(quotes[new Date().getDay() % quotes.length])

  useEffect(() => {
    Promise.all([analyticsApi.get(), tasksApi.getAll({ sort: 'dueDate' })])
      .then(([aRes, tRes]) => {
        setData(aRes.data.data)
        setTasks(tRes.data.tasks.filter(t => t.status !== 'completed').slice(0, 6))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="glass-card h-28 animate-pulse" />
      <GridSkeleton cols={4} height={28} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card h-56 animate-pulse" />
        <div className="glass-card h-56 animate-pulse" />
      </div>
    </div>
  )

  const s = data?.summary || {}
  const xpProgress = Math.min((user?.xp || 0) % 100, 100)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div className="glass-card p-6 relative overflow-hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)' }} />
        <div className="relative flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-2xl flex-shrink-0">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" /> : '👋'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold text-white">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}!</h2>
            <p className="text-white/40 text-sm font-body mt-0.5">{quote}</p>
          </div>
          <div className="hidden md:flex items-center gap-6 text-center flex-shrink-0">
            {[{ v: user?.xp || 0, l: 'Total XP', c: 'text-purple-400' }, { v: `Lv.${user?.level || 1}`, l: 'Level', c: 'text-amber-400' }, { v: `${user?.streak || 0}🔥`, l: 'Streak', c: 'text-orange-400' }].map(item => (
              <div key={item.l}>
                <p className={`font-display text-xl font-bold ${item.c}`}>{item.v}</p>
                <p className="text-xs text-white/25 font-body">{item.l}</p>
              </div>
            ))}
          </div>
        </div>
        {/* XP bar */}
        <div className="relative mt-4 h-1.5 rounded-full bg-white/8 overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #a855f7, #3b82f6)' }} initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} />
        </div>
        <p className="text-xs text-white/20 mt-1 font-body">{xpProgress}/100 XP to Level {(user?.level || 1) + 1}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={s.total || 0} icon="📋" gradient="linear-gradient(135deg, #a855f7, #3b82f6)" subtitle="All time" delay={0.05} />
        <StatCard title="Completed" value={s.completed || 0} icon="✅" gradient="linear-gradient(135deg, #10b981, #06b6d4)" subtitle={`${s.completionRate || 0}% rate`} delay={0.1} />
        <StatCard title="Pending" value={s.pending || 0} icon="⏳" gradient="linear-gradient(135deg, #f59e0b, #f97316)" subtitle="In queue" delay={0.15} />
        <StatCard title="Overdue" value={s.overdue || 0} icon="🚨" gradient="linear-gradient(135deg, #ef4444, #f97316)" subtitle="Need action" delay={0.2} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div className="lg:col-span-2 glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-white text-sm">Weekly Activity</h3>
              <p className="text-xs text-white/30 font-body">Tasks created vs completed</p>
            </div>
            <TrendingUp size={15} className="text-purple-400" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data?.weeklyData || []}>
              <defs>
                <linearGradient id="gc1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} /><stop offset="95%" stopColor="#a855f7" stopOpacity={0} /></linearGradient>
                <linearGradient id="gc2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 12, fontFamily: 'DM Sans', fontSize: 12, color: '#fff' }} />
              <Area type="monotone" dataKey="completed" stroke="#a855f7" fill="url(#gc1)" strokeWidth={2} name="Completed" />
              <Area type="monotone" dataKey="created" stroke="#3b82f6" fill="url(#gc2)" strokeWidth={2} name="Created" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card p-5 flex flex-col" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-display font-semibold text-white text-sm mb-1">Completion Rate</h3>
          <p className="text-xs text-white/30 font-body mb-4">Overall performance</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative">
              <RadialBarChart width={130} height={130} cx={65} cy={65} innerRadius={42} outerRadius={60} data={[{ value: s.completionRate || 0, fill: '#a855f7' }]}>
                <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} dataKey="value" cornerRadius={6} />
              </RadialBarChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold gradient-text">{s.completionRate || 0}%</span>
                <span className="text-xs text-white/25 font-body">done</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {[{ label: 'Study Hours', value: `${(s.studyHours || 0).toFixed(1)}h`, icon: '📚' }, { label: 'Upcoming (7d)', value: s.upcoming || 0, icon: '📅' }, { label: 'XP Earned', value: s.xp || 0, icon: '⚡' }].map(item => (
              <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-xs text-white/35 font-body">{item.icon} {item.label}</span>
                <span className="text-xs font-semibold text-white font-display">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upcoming tasks */}
      <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="font-display font-semibold text-white text-sm">Upcoming Tasks</h3><p className="text-xs text-white/30 font-body">By deadline</p></div>
          <Link to="/tasks" className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors font-body">View all <ArrowRight size={11} /></Link>
        </div>
        {tasks.length === 0 ? (
          <div className="text-center py-8"><div className="text-3xl mb-2">🎉</div><p className="text-white/30 text-sm font-body">All caught up!</p></div>
        ) : (
          <div className="space-y-1.5">
            {tasks.map((task, i) => {
              const due = getDueLabel(task.dueDate)
              return (
                <motion.div key={task._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.04 }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: priorityColors[task.priority] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-body truncate">{task.title}</p>
                    <p className="text-xs text-white/25 font-body">{task.subject}</p>
                  </div>
                  <span className={`text-xs font-body font-medium flex-shrink-0 ${due.color}`}>{due.label}</span>
                  <span className={`priority-${task.priority} hidden sm:inline-flex`}>{task.priority}</span>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Subject breakdown */}
      {(data?.subjectData?.length || 0) > 0 && (
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="font-display font-semibold text-white text-sm mb-4">Subject Breakdown</h3>
          <div className="space-y-3">
            {data.subjectData.map((s, i) => {
              const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
              const colors = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']
              return (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/60 font-body">{s.subject}</span>
                    <span className="text-xs text-white/30 font-body">{s.completed}/{s.total} · {pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: colors[i % colors.length] }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.08 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

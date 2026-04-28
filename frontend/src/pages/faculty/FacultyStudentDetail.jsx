import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, AlertTriangle, Clock, BookOpen, Trophy } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { facultyApi } from '../../services/api'
import { format, isPast, isToday } from 'date-fns'
import toast from 'react-hot-toast'

const priorityColors = { low: '#10b981', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' }
const tooltipStyle = { contentStyle: { background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 12, fontFamily: 'DM Sans', fontSize: 12, color: '#fff' } }

export default function FacultyStudentDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messageModal, setMessageModal] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    facultyApi.getStudent(id).then(r => setData(r.data)).finally(() => setLoading(false))
  }, [id])

  const sendMessage = async () => {
    if (!message.trim()) return
    try {
      await facultyApi.messageStudent(id, message)
      toast.success('Message sent to student!')
      setMessageModal(false)
      setMessage('')
    } catch { toast.error('Failed to send') }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="glass-card h-36 animate-pulse" />
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="glass-card h-24 animate-pulse" />)}</div>
    </div>
  )

  if (!data) return <div className="text-center py-20 text-white/30">Student not found</div>

  const { student, analytics } = data
  const t = analytics?.tasks || {}

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link to="/faculty/students" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors font-body">
        <ArrowLeft size={14} /> Back to Students
      </Link>

      {/* Profile card */}
      <motion.div className="glass-card p-6 relative overflow-hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)' }} />
        <div className="relative flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-3xl font-bold text-white font-display flex-shrink-0">
            {student.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold text-white">{student.name}</h2>
            <p className="text-white/40 font-body text-sm">{student.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {student.institution && <span className="badge-blue">{student.institution}</span>}
              {student.major && <span className="badge-purple">{student.major}</span>}
              {student.year && <span className="glass px-2 py-0.5 rounded-lg text-xs text-white/40">{student.year}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => setMessageModal(true)} className="btn-secondary text-sm">💬 Message</button>
          </div>
        </div>
        {/* XP stats */}
        <div className="relative grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/5">
          {[{ l: 'XP', v: student.xp || 0, c: 'text-purple-400' }, { l: 'Level', v: `Lv.${student.level || 1}`, c: 'text-amber-400' }, { l: 'Streak', v: `${student.streak || 0}🔥`, c: 'text-orange-400' }].map(item => (
            <div key={item.l} className="text-center">
              <p className={`font-display text-xl font-bold ${item.c}`}>{item.v}</p>
              <p className="text-xs text-white/25 font-body">{item.l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Task stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: t.total || 0, color: '#a855f7', icon: '📋' },
          { label: 'Completed', value: t.completed || 0, color: '#10b981', icon: '✅' },
          { label: 'Overdue', value: t.overdue || 0, color: '#ef4444', icon: '⚠️' },
          { label: 'Completion', value: `${t.completionRate || 0}%`, color: '#3b82f6', icon: '📊' },
        ].map((s, i) => (
          <motion.div key={s.label} className="glass-card p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/35 font-body">{s.label}</p>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly chart */}
      <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h3 className="font-display font-semibold text-white text-sm mb-1">Weekly Task Activity</h3>
        <p className="text-xs text-white/30 font-body mb-4">Last 7 days</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={analytics?.weeklyData || []}>
            <defs>
              <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} /><stop offset="95%" stopColor="#a855f7" stopOpacity={0} /></linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="completed" stroke="#a855f7" fill="url(#sg1)" strokeWidth={2} name="Completed" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent tasks */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-display font-semibold text-white text-sm mb-4">Recent Tasks</h3>
          <div className="space-y-2">
            {(analytics?.recentTasks || []).slice(0, 6).map(task => (
              <div key={task._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-colors">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: priorityColors[task.priority] }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-body truncate ${task.status === 'completed' ? 'line-through text-white/30' : 'text-white'}`}>{task.title}</p>
                  <p className="text-xs text-white/25 font-body">{task.subject}</p>
                </div>
                <span className={`status-${task.status} flex-shrink-0`}>{task.status}</span>
              </div>
            ))}
            {(analytics?.recentTasks?.length || 0) === 0 && <p className="text-center text-white/25 text-sm font-body py-4">No tasks found</p>}
          </div>
        </motion.div>

        {/* Subject breakdown */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 className="font-display font-semibold text-white text-sm mb-4">Subject Progress</h3>
          <div className="space-y-3">
            {(analytics?.subjectData || []).map((s, i) => {
              const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
              const colors = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']
              return (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/60 font-body">{s.subject}</span>
                    <span className="text-xs text-white/30 font-body">{s.completed}/{s.total} · {pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: colors[i % colors.length] }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                  </div>
                </div>
              )
            })}
            {(analytics?.subjectData?.length || 0) === 0 && <p className="text-center text-white/25 text-sm font-body py-4">No subject data</p>}
          </div>
        </motion.div>
      </div>

      {/* Message modal */}
      {messageModal && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMessageModal(false)} />
          <motion.div className="relative z-10 w-full max-w-md glass-dark rounded-2xl border border-white/10 p-6" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <h3 className="font-display font-bold text-white mb-4">Message {student.name}</h3>
            <textarea placeholder="Write your message..." className="input text-sm resize-none h-28 mb-4" value={message} onChange={e => setMessage(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setMessageModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <motion.button onClick={sendMessage} className="btn-primary flex-1 text-sm" whileHover={{ scale: 1.01 }}>Send</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

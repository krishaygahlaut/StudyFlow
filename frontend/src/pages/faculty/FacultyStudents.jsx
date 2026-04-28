import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, Filter, ArrowRight, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import { facultyApi } from '../../services/api'
import { EmptyState, TableSkeleton } from '../../components/ui/index'
import toast from 'react-hot-toast'

const PERF_FILTERS = [
  { label: 'All', value: '' },
  { label: '🔥 High Performers', value: 'high' },
  { label: '📊 Average', value: 'medium' },
  { label: '⚠️ Struggling', value: 'low' },
  { label: '🚨 At Risk', value: 'atrisk' },
]

function PerformanceBadge({ score }) {
  if (score >= 70) return <span className="badge-green">High</span>
  if (score >= 40) return <span className="badge-amber">Average</span>
  return <span className="badge-red">Low</span>
}

function ActivityBar({ value }) {
  const color = value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>
      <span className="text-xs text-white/40 font-body w-8">{value}%</span>
    </div>
  )
}

export default function FacultyStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [perf, setPerf] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})
  const [messageModal, setMessageModal] = useState(null)
  const [message, setMessage] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await facultyApi.getStudents({ search, performance: perf, page, limit: 15 })
      setStudents(res.data.students)
      setMeta({ total: res.data.total, pages: res.data.pages })
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }, [search, perf, page])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => { const t = setTimeout(fetch, 350); return () => clearTimeout(t) }, [search])

  const sendMessage = async () => {
    if (!message.trim()) return
    try {
      await facultyApi.messageStudent(messageModal._id, message)
      toast.success('Message sent!')
      setMessageModal(null)
      setMessage('')
    } catch { toast.error('Failed to send message') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Students</h1>
          <p className="page-subtitle">{meta.total || 0} students assigned to you</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input placeholder="Search by name, email, ID, major..." className="input pl-10 text-sm" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {PERF_FILTERS.map(f => (
            <button key={f.value} onClick={() => { setPerf(f.value); setPage(1) }}
              className="px-3 py-2 rounded-xl text-xs font-body border transition-all"
              style={perf === f.value ? { background: 'rgba(168,85,247,0.18)', borderColor: 'rgba(168,85,247,0.4)', color: '#c084fc' } : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? <TableSkeleton rows={8} /> : students.length === 0 ? (
          <EmptyState type="students" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th className="hidden md:table-cell">Institution</th>
                  <th>Tasks</th>
                  <th className="hidden lg:table-cell">Study Hours</th>
                  <th>Activity</th>
                  <th>Performance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {students.map((s, i) => (
                    <motion.tr key={s._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{s.name?.[0]?.toUpperCase()}</div>
                          <div className="min-w-0">
                            <p className="text-sm text-white font-body font-medium truncate">{s.name}</p>
                            <p className="text-xs text-white/30 font-body truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell">
                        <p className="text-sm font-body">{s.institution || '—'}</p>
                        <p className="text-xs text-white/30 font-body">{s.major}</p>
                      </td>
                      <td>
                        <div className="text-sm font-body">
                          <span className="text-emerald-400 font-semibold">{s.stats?.completed || 0}</span>
                          <span className="text-white/30"> / {s.stats?.total || 0}</span>
                        </div>
                        {(s.stats?.overdue || 0) > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <AlertTriangle size={10} className="text-red-400" />
                            <span className="text-xs text-red-400 font-body">{s.stats.overdue} overdue</span>
                          </div>
                        )}
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-sm font-body">{(s.stats?.studyHours || 0).toFixed(1)}h</span>
                      </td>
                      <td><ActivityBar value={s.stats?.activityScore || 0} /></td>
                      <td><PerformanceBadge score={s.stats?.activityScore || 0} /></td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setMessageModal(s)} className="btn-sm glass text-xs text-white/50 hover:text-white">Message</button>
                          <Link to={`/faculty/students/${s._id}`}><motion.div className="btn-icon" whileHover={{ scale: 1.05 }}><ArrowRight size={14} /></motion.div></Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {(meta.pages || 1) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-white/30 font-body">Page {page} of {meta.pages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-sm glass text-xs disabled:opacity-30">Previous</button>
              <button disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)} className="btn-sm glass text-xs disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Message modal */}
      <AnimatePresence>
        {messageModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMessageModal(null)} />
            <motion.div className="relative z-10 w-full max-w-md glass-dark rounded-2xl border border-white/10 p-6" initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}>
              <h3 className="font-display font-bold text-white mb-1">Message {messageModal.name}</h3>
              <p className="text-xs text-white/30 font-body mb-4">{messageModal.email}</p>
              <textarea placeholder="Write your message..." className="input text-sm resize-none h-28 mb-4" value={message} onChange={e => setMessage(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={() => setMessageModal(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <motion.button onClick={sendMessage} className="btn-primary flex-1 text-sm" whileHover={{ scale: 1.01 }}>Send Message</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

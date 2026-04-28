// CalendarPage.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, startOfWeek, endOfWeek, isPast } from 'date-fns'
import { tasksApi } from '../../services/api'

const priorityColors = { low: '#10b981', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' }

export function CalendarPage() {
  const [cur, setCur] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [selected, setSelected] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => { tasksApi.getAll({ sort: 'dueDate' }).then(r => setTasks(r.data.tasks)).finally(() => setLoading(false)) }, [])

  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(cur), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(cur), { weekStartsOn: 1 }) })
  const getDay = d => tasks.filter(t => isSameDay(new Date(t.dueDate), d))
  const selectedTasks = getDay(selected)
  const upcoming = tasks.filter(t => { const d = new Date(t.dueDate); const n = new Date(); return t.status !== 'completed' && d >= n && d <= new Date(n.getTime() + 7 * 86400000) }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 8)

  return (
    <div className="space-y-5">
      <div><h1 className="page-title">Calendar</h1><p className="page-subtitle">Visualize your task deadlines</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div className="lg:col-span-2 glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-white">{format(cur, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <button className="btn-icon" onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}><ChevronLeft size={15} /></button>
              <button className="btn-sm glass text-xs" onClick={() => setCur(new Date())}>Today</button>
              <button className="btn-icon" onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}><ChevronRight size={15} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="text-center text-xs text-white/25 font-body py-1.5">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const dayTasks = getDay(day)
              const isSelected = isSameDay(day, selected)
              const inMonth = isSameMonth(day, cur)
              const today = isToday(day)
              return (
                <motion.button key={i} onClick={() => setSelected(day)}
                  className={`aspect-square rounded-xl p-1 flex flex-col items-center transition-all ${isSelected ? 'border border-purple-500/40' : today ? 'border border-blue-500/20' : 'hover:bg-white/4'} ${!inMonth ? 'opacity-20' : ''}`}
                  style={isSelected ? { background: 'rgba(168,85,247,0.18)' } : today ? { background: 'rgba(59,130,246,0.08)' } : {}}
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
                >
                  <span className={`text-xs font-body ${today ? 'text-blue-400 font-bold' : isSelected ? 'text-purple-300 font-semibold' : 'text-white/55'}`}>{format(day, 'd')}</span>
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {dayTasks.slice(0, 3).map((t, j) => <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: t.status === 'overdue' ? '#ef4444' : priorityColors[t.priority] }} />)}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-display font-semibold text-white mb-1">{format(selected, 'MMM d, yyyy')}</h3>
          <p className="text-xs text-white/30 font-body mb-4">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} due</p>
          {selectedTasks.length === 0 ? <div className="text-center py-10"><div className="text-3xl mb-2">📅</div><p className="text-white/25 text-sm font-body">Nothing due today</p></div> : (
            <div className="space-y-2">
              {selectedTasks.map((task, i) => (
                <motion.div key={task._id} className="p-3 rounded-xl border" style={{ borderColor: `${priorityColors[task.priority]}25`, background: `${priorityColors[task.priority]}06` }} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: priorityColors[task.priority] }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-body font-medium ${task.status === 'completed' ? 'line-through text-white/25' : 'text-white'}`}>{task.title}</p>
                      <p className="text-xs text-white/25 mt-0.5 font-body">{task.subject} · {format(new Date(task.dueDate), 'h:mm a')}</p>
                      <span className={`status-${task.status} mt-1.5 inline-flex`}>{task.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="font-display font-semibold text-white text-sm mb-4">Upcoming Deadlines (Next 7 Days)</h3>
        {upcoming.length === 0 ? <p className="text-center text-white/20 text-sm font-body py-6">🎉 No deadlines this week!</p> : (
          <div className="space-y-2">
            {upcoming.map((task, i) => (
              <motion.div key={task._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}>
                <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: `${priorityColors[task.priority]}12`, border: `1px solid ${priorityColors[task.priority]}25` }}>
                  <span className="text-xs font-bold font-display" style={{ color: priorityColors[task.priority] }}>{format(new Date(task.dueDate), 'd')}</span>
                  <span className="text-xs text-white/25 font-body leading-none">{format(new Date(task.dueDate), 'MMM')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-body truncate">{task.title}</p>
                  <p className="text-xs text-white/25 font-body">{task.subject} · {format(new Date(task.dueDate), 'h:mm a')}</p>
                </div>
                <span className={`priority-${task.priority} flex-shrink-0`}>{task.priority}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
export default CalendarPage

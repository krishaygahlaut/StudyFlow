// StudyPlannerPage
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, BookOpen, Clock, Calendar, Check, Trash2, X } from 'lucide-react'
import { studyApi } from '../../services/api'
import { format, startOfWeek, addDays } from 'date-fns'
import { EmptyState } from '../../components/ui/index'
import toast from 'react-hot-toast'

const SUBJECTS = ['Mathematics','Physics','Chemistry','Computer Science','History','Literature','Economics','Biology','Engineering','Statistics']
const SC = ['#a855f7','#3b82f6','#10b981','#f59e0b','#ec4899','#06b6d4','#f97316','#84cc16','#8b5cf6','#14b8a6']

function SessionModal({ onClose, onSave }) {
  const [form, setForm] = useState({ subject:'', date:format(new Date(),'yyyy-MM-dd'), startTime:'09:00', endTime:'10:00', goal:'', weeklyGoalHours:2 })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const submit = async (e) => { e.preventDefault(); if (!form.subject) return toast.error('Select a subject'); setLoading(true); try { const r = await studyApi.create(form); onSave(r.data.session); toast.success('Session scheduled! 📚'); onClose() } catch { toast.error('Failed') } finally { setLoading(false) } }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative z-10 w-full max-w-md glass-dark rounded-2xl border border-white/10" initial={{ scale:0.92,y:16 }} animate={{ scale:1,y:0 }} exit={{ scale:0.92 }} transition={{ type:'spring', stiffness:300, damping:30 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5"><h2 className="font-display font-bold text-white">Schedule Session</h2><button onClick={onClose} className="text-white/30 hover:text-white text-lg">×</button></div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div><label className="label">Subject *</label><select className="input text-sm" value={form.subject} onChange={set('subject')} required><option value="" className="bg-dark-700">Select subject</option>{SUBJECTS.map(s=><option key={s} value={s} className="bg-dark-700">{s}</option>)}</select></div>
          <div><label className="label">Date</label><input type="date" className="input text-sm" value={form.date} onChange={set('date')} /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">Start</label><input type="time" className="input text-sm" value={form.startTime} onChange={set('startTime')} /></div><div><label className="label">End</label><input type="time" className="input text-sm" value={form.endTime} onChange={set('endTime')} /></div></div>
          <div><label className="label">Goal</label><input placeholder="e.g. Complete Chapter 5" className="input text-sm" value={form.goal} onChange={set('goal')} /></div>
          <div><label className="label">Weekly Goal (hours)</label><input type="number" min="0.5" max="12" step="0.5" className="input text-sm" value={form.weeklyGoalHours} onChange={set('weeklyGoalHours')} /></div>
          <div className="flex gap-3"><button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button><motion.button type="submit" className="btn-primary flex-1 text-sm" disabled={loading} whileHover={{ scale:1.01 }}>{loading ? 'Scheduling...' : 'Schedule'}</motion.button></div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export function StudyPlannerPage() {
  const [sessions, setSessions] = useState([])
  const [goals, setGoals] = useState({})
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = [...Array(7)].map((_,i) => addDays(weekStart, i))
  const colorMap = Object.fromEntries(SUBJECTS.map((s,i) => [s, SC[i % SC.length]]))

  const fetch = async () => { try { const [sR, gR] = await Promise.all([studyApi.getAll(), studyApi.getWeeklyGoals()]); setSessions(sR.data.sessions); setGoals(gR.data.weeklyHours); setTotalHours(gR.data.totalHours) } finally { setLoading(false) } }
  useEffect(() => { fetch() }, [])

  const complete = async (s) => { try { const r = await studyApi.update(s._id, { completed: !s.completed }); setSessions(p => p.map(x => x._id === s._id ? r.data.session : x)); if (!s.completed) toast.success('Session completed! 🎉'); fetch() } catch { toast.error('Failed') } }
  const del = async (id) => { try { await studyApi.delete(id); setSessions(p => p.filter(x => x._id !== id)); toast.success('Removed'); fetch() } catch { toast.error('Failed') } }
  const getDay = (d) => sessions.filter(s => format(new Date(s.date),'yyyy-MM-dd') === format(d,'yyyy-MM-dd'))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div><h1 className="page-title">Study Planner</h1><p className="page-subtitle">Schedule and track study sessions</p></div><motion.button className="btn-primary text-sm" onClick={() => setModal(true)} whileHover={{ scale:1.02 }}><Plus size={15} /><span className="hidden sm:inline">Schedule Session</span></motion.button></div>

      <motion.div className="glass-card p-5" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
        <div className="flex items-center justify-between mb-4"><div><h3 className="font-display font-semibold text-white text-sm">This Week</h3><p className="text-xs text-white/30 font-body">{totalHours.toFixed(1)} hours studied</p></div><div className="text-right"><p className="font-display text-xl font-bold gradient-text">{totalHours.toFixed(1)}h</p><p className="text-xs text-white/25 font-body">this week</p></div></div>
        {Object.keys(goals).length === 0 ? <p className="text-white/20 text-sm font-body text-center py-4">No sessions this week yet</p> : (
          <div className="space-y-3">{Object.entries(goals).map(([sub, hrs]) => { const c = colorMap[sub] || SC[0]; const pct = Math.min((hrs/3)*100,100); return(<div key={sub}><div className="flex items-center justify-between mb-1"><span className="text-xs text-white/55 font-body">{sub}</span><span className="text-xs text-white/30 font-body">{hrs.toFixed(1)}h / 3h</span></div><div className="h-2 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background:c }} initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1 }}/></div></div>) })}</div>
        )}
      </motion.div>

      <motion.div className="glass-card p-5" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
        <h3 className="font-display font-semibold text-white text-sm mb-4">Week View</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day,i) => { const daySess = getDay(day); const today = format(day,'yyyy-MM-dd')===format(new Date(),'yyyy-MM-dd'); return(
            <div key={i} className="flex flex-col">
              <div className={`text-center mb-1.5 py-1 rounded-lg ${today ? 'bg-purple-500/15' : ''}`}><p className={`text-xs font-body ${today ? 'text-purple-400 font-semibold' : 'text-white/35'}`}>{format(day,'EEE')}</p><p className={`text-sm font-display font-bold ${today ? 'text-purple-300' : 'text-white/50'}`}>{format(day,'d')}</p></div>
              <div className="space-y-1 min-h-12">{daySess.map(s=><div key={s._id} className="p-1 rounded text-xs font-body truncate" style={{ background:`${colorMap[s.subject]||'#a855f7'}18`, borderLeft:`2px solid ${colorMap[s.subject]||'#a855f7'}`, opacity:s.completed?0.5:1 }} title={`${s.subject}: ${s.startTime}`}><span className="truncate block" style={{ color:colorMap[s.subject]||'#a855f7' }}>{s.subject?.split(' ')[0]}</span><span className="text-white/25">{s.startTime}</span></div>)}</div>
            </div>
          )})}
        </div>
      </motion.div>

      <motion.div className="glass-card p-5" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}>
        <h3 className="font-display font-semibold text-white text-sm mb-4">All Sessions</h3>
        {loading ? <div className="space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="h-16 rounded-xl bg-white/3 animate-pulse"/>)}</div> : sessions.length===0 ? <EmptyState type="sessions" action={() => setModal(true)} actionLabel="Schedule Session" /> : (
          <div className="space-y-2">{sessions.map((s,i) => { const c = colorMap[s.subject]||SC[0]; return(
            <motion.div key={s._id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${s.completed ? 'opacity-50 border-white/4' : 'border-white/6 hover:border-white/12'}`} initial={{ opacity:0,x:-8 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.03 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${c}15` }}><BookOpen size={15} style={{ color:c }}/></div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-body font-medium ${s.completed ? 'line-through text-white/25' : 'text-white'}`}>{s.subject}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-white/30 font-body flex items-center gap-1"><Calendar size={10}/>{format(new Date(s.date),'MMM d')}</span>
                  <span className="text-xs text-white/30 font-body">{s.startTime} – {s.endTime||'—'}</span>
                  {s.duration>0&&<span className="text-xs font-body" style={{ color:c }}>~{(s.duration/60).toFixed(1)}h</span>}
                </div>
                {s.goal&&<p className="text-xs text-white/20 mt-0.5 font-body truncate">{s.goal}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.completed?'bg-emerald-500/20':'hover:bg-emerald-500/15'}`} onClick={() => complete(s)} whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}><Check size={13} className={s.completed?'text-emerald-400':'text-white/30'}/></motion.button>
                <motion.button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-400/15" onClick={() => del(s._id)} whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}><Trash2 size={13} className="text-white/30 hover:text-red-400"/></motion.button>
              </div>
            </motion.div>
          )})}
          </div>
        )}
      </motion.div>
      <AnimatePresence>{modal && <SessionModal onClose={() => setModal(false)} onSave={s => { setSessions(p => [s,...p]); fetch() }} />}</AnimatePresence>
    </div>
  )
}
export default StudyPlannerPage

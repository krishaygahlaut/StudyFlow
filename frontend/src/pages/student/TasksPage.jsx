import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, SlidersHorizontal, Check, Edit2, Trash2, Calendar, Clock, Tag } from 'lucide-react'
import { tasksApi } from '../../services/api'
import { TasksSkeleton, EmptyState } from '../../components/ui/index'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { format, isPast, isToday, isTomorrow } from 'date-fns'

const priorityColors = { low: '#10b981', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' }
const STATUS_FILTERS = [{ l: 'All', v: '' }, { l: 'To Do', v: 'todo' }, { l: 'In Progress', v: 'in-progress' }, { l: 'Completed', v: 'completed' }, { l: 'Overdue', v: 'overdue' }]
const PRIORITY_FILTERS = [{ l: 'All', v: '' }, { l: 'Low', v: 'low' }, { l: 'Medium', v: 'medium' }, { l: 'High', v: 'high' }, { l: 'Urgent', v: 'urgent' }]

function getDueLabel(date) {
  const d = new Date(date)
  if (isPast(d) && !isToday(d)) return { label: 'Overdue', color: 'text-red-400' }
  if (isToday(d)) return { label: `Today ${format(d, 'h:mm a')}`, color: 'text-amber-400' }
  if (isTomorrow(d)) return { label: `Tomorrow ${format(d, 'h:mm a')}`, color: 'text-orange-300' }
  return { label: format(d, 'MMM d, h:mm a'), color: 'text-white/35' }
}

function TaskCard({ task, onEdit, onDelete, onChange }) {
  const isCompleted = task.status === 'completed'
  const due = getDueLabel(task.dueDate)

  const toggle = async () => {
    try {
      const res = await tasksApi.update(task._id, { status: isCompleted ? 'todo' : 'completed' })
      if (!isCompleted) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b'] })
        toast.success(`+${task.xpReward || 10} XP earned! 🎉`, { icon: '⚡' })
      }
      onChange(res.data.task)
    } catch { toast.error('Update failed') }
  }

  const remove = async () => {
    if (!confirm('Delete this task?')) return
    try { await tasksApi.delete(task._id); toast.success('Task deleted'); onDelete(task._id) }
    catch { toast.error('Delete failed') }
  }

  return (
    <motion.div
      layout
      className={`group relative rounded-2xl p-4 border transition-all duration-200 ${isCompleted ? 'opacity-55 border-white/4 bg-white/1' : task.status === 'overdue' ? 'border-red-400/20 bg-red-400/4' : 'glass border-white/6 hover:border-purple-400/25 hover:bg-white/4'}`}
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={!isCompleted ? { y: -1 } : {}}
    >
      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: priorityColors[task.priority] }} />
      <div className="pl-3">
        <div className="flex items-start gap-3">
          <motion.button
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 hover:border-purple-400'}`}
            onClick={toggle} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
          >
            {isCompleted && <Check size={11} className="text-white" strokeWidth={3} />}
          </motion.button>
          <div className="flex-1 min-w-0">
            <p className={`font-body text-sm font-medium leading-snug ${isCompleted ? 'line-through text-white/25' : 'text-white'}`}>{task.title}</p>
            {task.description && <p className="text-xs text-white/25 mt-0.5 line-clamp-1 font-body">{task.description}</p>}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <motion.button className="w-7 h-7 glass rounded-lg flex items-center justify-center text-white/35 hover:text-blue-400 transition-colors" onClick={() => onEdit(task)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Edit2 size={12} /></motion.button>
            <motion.button className="w-7 h-7 glass rounded-lg flex items-center justify-center text-white/35 hover:text-red-400 transition-colors" onClick={remove} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Trash2 size={12} /></motion.button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
          {task.subject && <span className="text-xs text-white/35 font-body flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: priorityColors[task.priority] }} />{task.subject}</span>}
          <span className={`text-xs font-body flex items-center gap-1 ${due.color}`}><Calendar size={10} />{due.label}</span>
          {task.estimatedTime > 0 && <span className="text-xs text-white/25 font-body flex items-center gap-1"><Clock size={10} />{task.estimatedTime < 60 ? `${task.estimatedTime}m` : `${(task.estimatedTime / 60).toFixed(1)}h`}</span>}
          <span className={`priority-${task.priority} ml-auto`}>{task.priority}</span>
        </div>
        {(task.tags?.length || 0) > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {task.tags.slice(0, 3).map(tag => <span key={tag} className="text-xs px-2 py-0.5 rounded-lg text-white/25 font-body" style={{ background: 'rgba(255,255,255,0.04)' }}>#{tag}</span>)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function TaskModal({ task, onClose, onSave }) {
  const isEdit = !!task?._id
  const [form, setForm] = useState({
    title: task?.title || '', description: task?.description || '', subject: task?.subject || '',
    priority: task?.priority || 'medium', category: task?.category || 'assignment',
    status: task?.status || 'todo', estimatedTime: task?.estimatedTime || '',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") : '',
    tags: task?.tags?.join(', ') || '',
  })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.dueDate) return toast.error('Title and due date are required')
    setLoading(true)
    try {
      const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [], estimatedTime: form.estimatedTime ? Number(form.estimatedTime) : 0 }
      const res = isEdit ? await tasksApi.update(task._id, data) : await tasksApi.create(data)
      const saved = isEdit ? res.data.task : res.data.task
      toast.success(isEdit ? 'Task updated! ✏️' : 'Task created! 🎯')
      onSave(saved)
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setLoading(false) }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative z-10 w-full max-w-lg glass-dark rounded-2xl border border-white/10 overflow-hidden" initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div><h2 className="font-display font-bold text-white">{isEdit ? 'Edit Task' : 'New Task'}</h2><p className="text-xs text-white/25 font-body mt-0.5">{isEdit ? 'Update task details' : 'Add to your task queue'}</p></div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-lg">×</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div><label className="label">Title *</label><input placeholder="Task title" required className="input text-sm" value={form.title} onChange={set('title')} /></div>
          <div><label className="label">Description</label><textarea placeholder="Optional details..." className="input text-sm resize-none h-20" value={form.description} onChange={set('description')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Subject</label><input placeholder="CS 101" className="input text-sm" value={form.subject} onChange={set('subject')} /></div>
            <div><label className="label">Category</label><select className="input text-sm" value={form.category} onChange={set('category')}>{['assignment','exam','project','reading','lab','presentation','other'].map(c => <option key={c} value={c} className="bg-dark-700 capitalize">{c}</option>)}</select></div>
          </div>
          <div>
            <label className="label">Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {['low','medium','high','urgent'].map(p => (
                <button key={p} type="button" onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                  className="py-2 rounded-xl text-xs font-body border capitalize transition-all"
                  style={form.priority === p ? { background: `${priorityColors[p]}18`, borderColor: `${priorityColors[p]}40`, color: priorityColors[p] } : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
                >{p}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Due Date *</label><input type="datetime-local" required className="input text-sm" value={form.dueDate} onChange={set('dueDate')} /></div>
            <div><label className="label">Est. Minutes</label><input type="number" min="0" placeholder="90" className="input text-sm" value={form.estimatedTime} onChange={set('estimatedTime')} /></div>
          </div>
          <div><label className="label">Tags (comma-separated)</label><input placeholder="math, exam, important" className="input text-sm" value={form.tags} onChange={set('tags')} /></div>
          {isEdit && <div><label className="label">Status</label><select className="input text-sm" value={form.status} onChange={set('status')}>{['todo','in-progress','completed','overdue'].map(s => <option key={s} value={s} className="bg-dark-700">{s.replace('-',' ')}</option>)}</select></div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
            <motion.button type="submit" className="btn-primary flex-1 text-sm" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {loading ? <span className="flex items-center gap-2"><motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />Saving...</span> : isEdit ? 'Update Task' : 'Create Task'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [sort, setSort] = useState('dueDate')
  const [showFilters, setShowFilters] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = { sort }
      if (status) params.status = status
      if (priority) params.priority = priority
      if (search) params.search = search
      const res = await tasksApi.getAll(params)
      setTasks(res.data.tasks)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }, [status, priority, sort])

  useEffect(() => { fetchTasks() }, [fetchTasks])
  useEffect(() => { const t = setTimeout(fetchTasks, 380); return () => clearTimeout(t) }, [search])

  const handleSave = (saved) => setTasks(prev => { const idx = prev.findIndex(t => t._id === saved._id); if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n } return [saved, ...prev] })
  const handleDelete = (id) => setTasks(prev => prev.filter(t => t._id !== id))
  const handleChange = (updated) => setTasks(prev => prev.map(t => t._id === updated._id ? updated : t))

  const stats = { total: tasks.length, completed: tasks.filter(t => t.status === 'completed').length, overdue: tasks.filter(t => t.status === 'overdue').length, pending: tasks.filter(t => ['todo','in-progress'].includes(t.status)).length }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Tasks</h1><p className="page-subtitle">{stats.total} tasks · {stats.pending} pending · {stats.overdue} overdue</p></div>
        <motion.button className="btn-primary text-sm" onClick={() => { setEditTask(null); setModal(true) }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Plus size={15} /><span className="hidden sm:inline">New Task</span></motion.button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[{ l: 'Total', v: stats.total, c: '#a855f7' }, { l: 'Pending', v: stats.pending, c: '#3b82f6' }, { l: 'Done', v: stats.completed, c: '#10b981' }, { l: 'Overdue', v: stats.overdue, c: '#ef4444' }].map(s => (
          <div key={s.l} className="glass rounded-xl p-3 text-center">
            <p className="font-display text-xl font-bold" style={{ color: s.c }}>{s.v}</p>
            <p className="text-xs text-white/25 font-body">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1"><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" /><input placeholder="Search tasks..." className="input pl-10 text-sm" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <select className="input w-36 text-sm" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="dueDate" className="bg-dark-700">By Deadline</option>
            <option value="priority" className="bg-dark-700">By Priority</option>
            <option value="created" className="bg-dark-700">By Created</option>
          </select>
          <motion.button className={`btn-icon ${showFilters ? 'text-purple-400' : ''}`} onClick={() => setShowFilters(!showFilters)} whileHover={{ scale: 1.05 }}><SlidersHorizontal size={16} /></motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div className="glass-card p-4 space-y-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div>
                <p className="text-xs text-white/30 mb-2 font-body">Status</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_FILTERS.map(f => <button key={f.v} onClick={() => setStatus(f.v)} className="px-3 py-1.5 rounded-xl text-xs font-body border transition-all" style={status === f.v ? { background: 'rgba(168,85,247,0.18)', borderColor: 'rgba(168,85,247,0.4)', color: '#c084fc' } : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>{f.l}</button>)}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/30 mb-2 font-body">Priority</p>
                <div className="flex gap-2 flex-wrap">
                  {PRIORITY_FILTERS.map(f => <button key={f.v} onClick={() => setPriority(f.v)} className="px-3 py-1.5 rounded-xl text-xs font-body border transition-all" style={priority === f.v ? { background: 'rgba(168,85,247,0.18)', borderColor: 'rgba(168,85,247,0.4)', color: '#c084fc' } : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>{f.l}</button>)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? <TasksSkeleton /> : tasks.length === 0 ? (
        <EmptyState type={search || status || priority ? 'search' : 'tasks'} action={!search && !status && !priority ? () => { setEditTask(null); setModal(true) } : undefined} actionLabel="+ Create Task" />
      ) : (
        <motion.div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {tasks.map(task => <TaskCard key={task._id} task={task} onEdit={(t) => { setEditTask(t); setModal(true) }} onDelete={handleDelete} onChange={handleChange} />)}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {modal && <TaskModal task={editTask} onClose={() => { setModal(false); setEditTask(null) }} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  )
}

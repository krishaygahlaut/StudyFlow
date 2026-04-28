import { motion } from 'framer-motion'

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ title, value, icon, gradient, subtitle, delay = 0, trend }) {
  return (
    <motion.div
      className="glass-card p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}
    >
      <div className="absolute inset-0 opacity-[0.04] rounded-2xl" style={{ background: gradient }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-white/35 font-body uppercase tracking-wider">{title}</p>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${gradient.split(',')[1]?.trim().split(')')[0]}15` || 'rgba(168,85,247,0.1)' }}>
            {icon}
          </div>
        </div>
        <motion.p className="font-display text-3xl font-bold text-white" initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ duration: 0.4, delay: delay + 0.1, type: 'spring' }}>
          {value}
        </motion.p>
        {subtitle && <p className="text-xs text-white/25 mt-1 font-body">{subtitle}</p>}
        <div className="h-0.5 rounded-full bg-white/5 mt-3 overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: gradient }} initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }} />
        </div>
      </div>
    </motion.div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EMPTY = {
  tasks: { emoji: '📋', title: 'No tasks yet', sub: 'Create your first task to start tracking your work' },
  notes: { emoji: '📝', title: 'No notes here', sub: 'Capture ideas and study notes' },
  search: { emoji: '🔍', title: 'No results found', sub: 'Try different search terms or filters' },
  sessions: { emoji: '📚', title: 'No study sessions', sub: 'Schedule a session to track your study time' },
  achievements: { emoji: '🏆', title: 'No achievements yet', sub: 'Complete tasks to start earning badges' },
  students: { emoji: '👥', title: 'No students assigned', sub: 'Students assigned to you will appear here' },
  notifications: { emoji: '🔔', title: "All clear!", sub: 'No notifications right now' },
  users: { emoji: '👤', title: 'No users found', sub: 'Try adjusting your search or filters' },
  logs: { emoji: '📋', title: 'No audit logs', sub: 'Activity logs will appear here' },
}

export function EmptyState({ type = 'tasks', action, actionLabel }) {
  const cfg = EMPTY[type] || EMPTY.tasks
  return (
    <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <motion.div className="text-5xl mb-5 select-none" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        {cfg.emoji}
      </motion.div>
      <h3 className="font-display text-lg font-semibold text-white mb-1.5">{cfg.title}</h3>
      <p className="text-white/30 text-sm font-body max-w-xs leading-relaxed">{cfg.sub}</p>
      {action && actionLabel && (
        <motion.button onClick={action} className="btn-primary text-sm mt-5" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Bone({ className }) {
  return (
    <motion.div
      className={`rounded-xl ${className}`}
      style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '400% 100%' }}
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
    />
  )
}

export function TasksSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-start gap-3">
          <Bone className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <Bone className="h-3.5 w-3/4" />
            <Bone className="h-3 w-1/2" />
            <div className="flex gap-2 pt-1"><Bone className="h-5 w-16" /><Bone className="h-5 w-20" /></div>
          </div>
          <Bone className="h-5 w-14 flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function GridSkeleton({ cols = 4, rows = 1, height = 28 }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${cols} gap-4`}>
      {[...Array(cols * rows)].map((_, i) => <Bone key={i} className={`h-${height} rounded-2xl`} />)}
    </div>
  )
}

export function TableSkeleton({ rows = 8 }) {
  return (
    <div className="space-y-px">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-white/4">
          <Bone className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5"><Bone className="h-3.5 w-1/3" /><Bone className="h-3 w-1/4" /></div>
          <Bone className="h-5 w-16" />
          <Bone className="h-5 w-20" />
          <Bone className="h-7 w-16" />
        </div>
      ))}
    </div>
  )
}

export default StatCard

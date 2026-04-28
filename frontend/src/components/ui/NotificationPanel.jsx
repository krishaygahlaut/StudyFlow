import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Trash2, BellOff } from 'lucide-react'
import { notifApi } from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationPanel({ onClose }) {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notifApi.getAll().then(r => { setNotifs(r.data.notifications); setLoading(false) }).catch(() => setLoading(false))
    notifApi.markRead().catch(() => {})
  }, [])

  const del = async (id) => {
    await notifApi.delete(id).catch(() => {})
    setNotifs(p => p.filter(n => n._id !== id))
  }

  return (
    <>
      <motion.div className="fixed inset-0 z-40" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div
        className="fixed right-4 top-[68px] z-50 w-80 glass-dark rounded-2xl border border-white/8 shadow-glass overflow-hidden"
        initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.18 }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h3 className="font-display font-semibold text-sm text-white">Notifications</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={15} /></button>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center"><div className="w-5 h-5 mx-auto border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>
          ) : notifs.length === 0 ? (
            <div className="p-10 text-center">
              <BellOff size={28} className="mx-auto mb-3 text-white/15" />
              <p className="text-white/25 text-sm font-body">No notifications</p>
            </div>
          ) : notifs.map((n, i) => (
            <motion.div
              key={n._id}
              className={`flex gap-3 px-4 py-3 border-b border-white/4 hover:bg-white/2 transition-colors group ${!n.read ? 'bg-purple-500/4' : ''}`}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white leading-snug">{n.title}</p>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-white/20 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
              </div>
              <button onClick={() => del(n._id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all flex-shrink-0 mt-0.5">
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  )
}

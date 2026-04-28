import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Play, Pause, RotateCcw, X, Coffee, Brain } from 'lucide-react'
import toast from 'react-hot-toast'

const MODES = {
  focus: { label: 'Focus', secs: 25 * 60, color: '#a855f7' },
  short: { label: 'Break', secs: 5 * 60, color: '#10b981' },
  long: { label: 'Long Break', secs: 15 * 60, color: '#3b82f6' },
}

export default function FloatingTimer() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('focus')
  const [left, setLeft] = useState(MODES.focus.secs)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const ivRef = useRef(null)
  const cur = MODES[mode]
  const pct = ((cur.secs - left) / cur.secs) * 100
  const R = 52, C = 2 * Math.PI * R
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const stop = useCallback(() => { clearInterval(ivRef.current); setRunning(false) }, [])
  const start = useCallback(() => {
    setRunning(true)
    ivRef.current = setInterval(() => {
      setLeft(t => {
        if (t <= 1) {
          clearInterval(ivRef.current)
          setRunning(false)
          if (mode === 'focus') { setSessions(s => s + 1); toast.success('🍅 Focus session done! Take a break.', { duration: 5000 }) }
          else toast.success('⚡ Break over! Stay focused.', { duration: 4000 })
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [mode])

  const reset = useCallback(() => { stop(); setLeft(MODES[mode].secs) }, [mode, stop])
  const switchMode = (m) => { stop(); setMode(m); setLeft(MODES[m].secs) }

  useEffect(() => {
    document.title = running ? `${fmt(left)} — StudyFlow` : 'StudyFlow Pro'
    return () => { document.title = 'StudyFlow Pro' }
  }, [left, running])
  useEffect(() => () => clearInterval(ivRef.current), [])

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            className="fixed bottom-6 right-6 z-40 w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-glow-purple"
            onClick={() => setOpen(true)}
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.9 }}
            title="Pomodoro Timer"
          >
            <Timer size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-64 glass-dark rounded-2xl border border-white/10 p-5 shadow-glass"
            initial={{ opacity: 0, scale: 0.85, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {mode === 'focus' ? <Brain size={14} style={{ color: cur.color }} /> : <Coffee size={14} style={{ color: cur.color }} />}
                <span className="text-xs font-display font-semibold" style={{ color: cur.color }}>{cur.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/25 font-body">🍅 {sessions}</span>
                <button onClick={() => setOpen(false)} className="text-white/25 hover:text-white transition-colors"><X size={14} /></button>
              </div>
            </div>

            <div className="flex gap-1.5 mb-4">
              {Object.entries(MODES).map(([k, m]) => (
                <button key={k} onClick={() => switchMode(k)} className="flex-1 py-1.5 rounded-lg text-xs font-body transition-all border"
                  style={mode === k ? { background: `${m.color}20`, borderColor: `${m.color}40`, color: m.color } : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                  {m.label.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg width="128" height="128" className="-rotate-90">
                  <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                  <motion.circle cx="64" cy="64" r={R} fill="none" stroke={cur.color} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={C} strokeDashoffset={C - (pct / 100) * C}
                    transition={{ duration: 0.4 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-2xl font-bold text-white">{fmt(left)}</span>
                  <span className="text-xs text-white/25 font-body">{Math.round(pct)}%</span>
                </div>
                {running && <motion.div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 24px ${cur.color}35` }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <motion.button onClick={reset} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/35 hover:text-white transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <RotateCcw size={14} />
              </motion.button>
              <motion.button onClick={running ? stop : start} className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${cur.color}, ${cur.color}99)` }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                {running ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </motion.button>
              <div className="w-9 h-9" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── LoadingScreen ───────────────────────────────────────────────────────────
import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-900 flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div className="w-14 h-14 mx-auto mb-5 rounded-2xl gradient-bg flex items-center justify-center" animate={{ rotate: 360, borderRadius: ['16px', '50%', '16px'] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <span className="text-white text-xl">⚡</span>
        </motion.div>
        <motion.p className="font-display text-lg font-bold gradient-text" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>StudyFlow Pro</motion.p>
        <p className="text-white/25 text-xs mt-1.5 font-body">Loading workspace...</p>
      </div>
    </div>
  )
}

export default LoadingScreen

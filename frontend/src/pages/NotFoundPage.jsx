import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute w-96 h-96 rounded-full opacity-8" style={{ background:'radial-gradient(circle,#a855f7,transparent)', top:'20%', left:'15%' }} animate={{ scale:[1,1.2,1], x:[0,20,0] }} transition={{ duration:8,repeat:Infinity }} />
        <motion.div className="absolute w-64 h-64 rounded-full opacity-6" style={{ background:'radial-gradient(circle,#3b82f6,transparent)', bottom:'20%', right:'15%' }} animate={{ scale:[1.2,1,1.2], x:[0,-20,0] }} transition={{ duration:6,repeat:Infinity }} />
      </div>
      <motion.div className="relative text-center max-w-lg" initial={{ opacity:0,y:24 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5 }}>
        <div className="relative mb-6 select-none">
          <div className="font-display text-[9rem] font-black leading-none" style={{ background:'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(59,130,246,0.08))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>404</div>
          <motion.div className="absolute inset-0 font-display text-[9rem] font-black leading-none gradient-text" animate={{ opacity:[0.6,1,0.6] }} transition={{ duration:2,repeat:Infinity }} style={{ filter:'blur(24px)' }}>404</motion.div>
        </div>
        <motion.div className="text-5xl mb-5" animate={{ rotate:[0,10,-10,0],scale:[1,1.1,1] }} transition={{ duration:3,repeat:Infinity }}>🔭</motion.div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-white/35 font-body mb-8">This page drifted into deep space. Let's get you back.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/dashboard"><motion.div className="btn-primary flex items-center gap-2" whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}><Home size={15}/>Dashboard</motion.div></Link>
          <button onClick={() => window.history.back()}><motion.div className="btn-secondary flex items-center gap-2" whileHover={{ scale:1.03 }}><ArrowLeft size={15}/>Go Back</motion.div></button>
        </div>
      </motion.div>
    </div>
  )
}

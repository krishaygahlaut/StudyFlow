import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, GraduationCap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await login(form)
      const role = res.user.role
      if (role === 'admin') navigate('/admin')
      else if (role === 'faculty') navigate('/faculty')
      else navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
      setErrors({ form: err.response?.data?.message })
    } finally { setLoading(false) }
  }

  const fillDemo = (role) => {
    const creds = {
      student: { email: 'alex@studyflow.app', password: 'Student@123456' },
      faculty: { email: 'sarah.chen@studyflow.app', password: 'Faculty@123456' },
      admin: { email: 'admin@studyflow.app', password: 'Admin@123456' },
    }
    setForm(creds[role])
    setErrors({})
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-16" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(59,130,246,0.08) 100%)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 30%, rgba(168,85,247,0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(59,130,246,0.12) 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-sm text-center">
          <motion.div className="w-20 h-20 mx-auto mb-8 rounded-3xl flex items-center justify-center gradient-bg" animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
            <Zap size={36} className="text-white" />
          </motion.div>
          <h1 className="font-display text-5xl font-black text-white mb-4 leading-tight">Study<span className="gradient-text">Flow</span> Pro</h1>
          <p className="font-body text-white/45 text-base leading-relaxed mb-10">The complete academic productivity platform for students, faculty, and institutions.</p>
          <div className="grid grid-cols-2 gap-3">
            {[['📋', 'Task Management'], ['📊', 'Analytics'], ['👨‍🏫', 'Faculty View'], ['🏆', 'Gamification']].map(([icon, label]) => (
              <motion.div key={label} className="glass rounded-2xl p-4 text-center" whileHover={{ y: -3, scale: 1.02 }}>
                <div className="text-2xl mb-1.5">{icon}</div>
                <p className="text-xs text-white/45 font-body">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 lg:max-w-[440px] flex items-center justify-center p-8">
        <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center"><Zap size={15} className="text-white" /></div>
              <span className="font-display text-lg font-bold gradient-text">StudyFlow Pro</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-1.5">Welcome back</h2>
            <p className="text-white/35 font-body text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input type="email" placeholder="you@example.com" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })) }} />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1 font-body">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-body">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`} value={form.password} onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })) }} />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1 font-body">{errors.password}</p>}
            </div>

            {errors.form && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-300 font-body" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {errors.form}
              </div>
            )}

            <motion.button type="submit" className="btn-primary w-full" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {loading ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> : <><span>Sign In</span><ArrowRight size={15} /></>}
            </motion.button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5">
            <p className="text-center text-xs text-white/25 font-body mb-3">— Quick Demo Access —</p>
            <div className="grid grid-cols-3 gap-2">
              {[['🎓', 'Student', 'student'], ['👨‍🏫', 'Faculty', 'faculty'], ['🛡️', 'Admin', 'admin']].map(([icon, label, role]) => (
                <motion.button key={role} onClick={() => fillDemo(role)} className="py-2 rounded-xl text-xs font-body transition-all glass hover:border-purple-400/30 text-white/50 hover:text-white/80" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  {icon} {label}
                </motion.button>
              ))}
            </div>
          </div>

          <p className="text-center text-white/25 text-sm mt-6 font-body">
            No account?{' '}<Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

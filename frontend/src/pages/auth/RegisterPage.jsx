// RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Building, BookOpen, Eye, EyeOff, ArrowRight, Zap, Check, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const rules = [
  { label: '8+ characters', test: p => p.length >= 8 },
  { label: 'Uppercase letter', test: p => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: p => /[a-z]/.test(p) },
  { label: 'Number', test: p => /[0-9]/.test(p) },
  { label: 'Special character', test: p => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', institution: '', major: '', role: 'student' })
  const [showPass, setShowPass] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (rules.some(r => !r.test(form.password))) e.password = 'Password does not meet requirements'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const passStrength = rules.filter(r => r.test(form.password)).length

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="flex items-center gap-2 justify-center mb-5">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center"><Zap size={17} className="text-white" /></div>
            <span className="font-display text-xl font-bold gradient-text">StudyFlow Pro</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-1.5">Create Account</h2>
          <p className="text-white/35 font-body text-sm">Start your productivity journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            {/* Role selector */}
            <div className="col-span-2">
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {[['🎓', 'Student', 'student'], ['👨‍🏫', 'Faculty', 'faculty']].map(([icon, label, role]) => (
                  <button key={role} type="button" onClick={() => setForm(p => ({ ...p, role }))}
                    className="py-2.5 rounded-xl text-sm font-body border transition-all"
                    style={form.role === role ? { background: 'rgba(168,85,247,0.18)', borderColor: 'rgba(168,85,247,0.4)', color: '#c084fc' } : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
                  >{icon} {label}</button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="label">Full Name</label>
              <div className="relative"><User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" /><input placeholder="Alex Johnson" className={`input pl-10 ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={set('name')} /></div>
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>

            <div className="col-span-2">
              <label className="label">Email</label>
              <div className="relative"><Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" /><input type="email" placeholder="you@email.com" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={set('email')} /></div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div className="col-span-2">
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input type={showPass ? 'text' : 'password'} placeholder="Strong password" className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`} value={form.password} onChange={set('password')} onFocus={() => setShowRules(true)} />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Strength bar */}
              {showRules && form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: i <= passStrength ? ['#ef4444','#f97316','#f59e0b','#84cc16','#10b981'][passStrength-1] : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {rules.map(r => (
                      <div key={r.label} className="flex items-center gap-1.5 text-xs font-body">
                        {r.test(form.password) ? <Check size={11} className="text-emerald-400 flex-shrink-0" /> : <X size={11} className="text-white/20 flex-shrink-0" />}
                        <span className={r.test(form.password) ? 'text-white/50' : 'text-white/20'}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="label">Institution</label>
              <div className="relative"><Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" /><input placeholder="MIT, Stanford..." className="input pl-10 text-sm" value={form.institution} onChange={set('institution')} /></div>
            </div>
            <div>
              <label className="label">Major / Dept.</label>
              <div className="relative"><BookOpen size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" /><input placeholder="Computer Science" className="input pl-10 text-sm" value={form.major} onChange={set('major')} /></div>
            </div>
          </div>

          <motion.button type="submit" className="btn-primary w-full mt-2" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            {loading ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} /> : <><span>Create Account</span><ArrowRight size={15} /></>}
          </motion.button>
        </form>

        <p className="text-center text-white/25 text-sm mt-5 font-body">
          Have an account?{' '}<Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default RegisterPage

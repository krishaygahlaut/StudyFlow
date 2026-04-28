import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Check, X, Zap, ArrowLeft } from 'lucide-react'
import { authApi } from '../../services/api'
import toast from 'react-hot-toast'

const rules = [
  { label: '8+ characters', test: p => p.length >= 8 },
  { label: 'Uppercase letter', test: p => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: p => /[a-z]/.test(p) },
  { label: 'Number', test: p => /[0-9]/.test(p) },
  { label: 'Special character', test: p => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const passStrength = rules.filter(r => r.test(form.password)).length
  const strengthColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (passStrength < 5) return toast.error('Password must meet all requirements')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await authApi.resetPassword(token, { password: form.password, confirmPassword: form.confirmPassword })
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired')
    } finally { setLoading(false) }
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <motion.div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.6 }}>
          <Check size={36} className="text-emerald-400" />
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">Password Reset!</h2>
        <p className="text-white/40 font-body text-sm">Redirecting to login in 3 seconds...</p>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl gradient-bg-red flex items-center justify-center"><Lock size={24} className="text-white" /></div>
          <h2 className="font-display text-2xl font-bold text-white mb-1.5">Reset Password</h2>
          <p className="text-white/35 font-body text-sm">Create a strong new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input type={showPass ? 'text' : 'password'} placeholder="Strong password" className="input pl-10 pr-10" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: i <= passStrength ? strengthColors[passStrength - 1] : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {rules.map(r => (
                    <div key={r.label} className="flex items-center gap-1.5 text-xs font-body">
                      {r.test(form.password) ? <Check size={10} className="text-emerald-400 flex-shrink-0" /> : <X size={10} className="text-white/20 flex-shrink-0" />}
                      <span className={r.test(form.password) ? 'text-white/50' : 'text-white/20'}>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input type="password" placeholder="Repeat password" className="input pl-10" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} />
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-xs text-red-400 mt-1 font-body">Passwords do not match</p>
            )}
          </div>

          <motion.button type="submit" className="btn-danger w-full" disabled={loading} whileHover={{ scale: 1.01 }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white/60 transition-colors font-body">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export function VerifyEmailPage() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div className="text-center max-w-sm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        {status === 'loading' && (
          <>
            <motion.div className="w-16 h-16 mx-auto mb-6 border-4 border-purple-500/30 border-t-purple-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <p className="text-white/50 font-body">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-4xl">✅</div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-white/40 font-body text-sm mb-6">Your account is fully activated.</p>
            <Link to="/login" className="btn-primary inline-flex">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center text-4xl">❌</div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Link Expired</h2>
            <p className="text-white/40 font-body text-sm mb-6">This verification link is invalid or has expired.</p>
            <Link to="/login" className="btn-secondary inline-flex">Back to Login</Link>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage

// ForgotPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Zap } from 'lucide-react'
import { authApi } from '../../services/api'
import toast from 'react-hot-toast'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch { toast.error('Something went wrong. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl gradient-bg flex items-center justify-center"><Zap size={24} className="text-white" /></div>
          {sent ? (
            <>
              <div className="text-5xl mb-4">📧</div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-white/40 font-body text-sm">If an account exists for <strong className="text-white/60">{email}</strong>, a password reset link has been sent.</p>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold text-white mb-1.5">Forgot Password</h2>
              <p className="text-white/35 font-body text-sm">Enter your email and we'll send you a reset link.</p>
            </>
          )}
        </div>
        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative"><Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" /><input type="email" placeholder="you@example.com" required className="input pl-10" value={email} onChange={e => setEmail(e.target.value)} /></div>
            </div>
            <motion.button type="submit" className="btn-primary w-full" disabled={loading} whileHover={{ scale: 1.01 }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </motion.button>
          </form>
        )}
        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white/60 transition-colors font-body">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage

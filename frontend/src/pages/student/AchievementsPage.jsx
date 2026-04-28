// AchievementsPage
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Flame, Trophy } from 'lucide-react'
import { achievementsApi } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'

const RARITY = { common:'badge-green', rare:'badge-blue', epic:'badge-purple', legendary:'badge-amber' }
const RCOLORS = { common:'#10b981', rare:'#3b82f6', epic:'#a855f7', legendary:'#f59e0b' }
const ALL = [
  { type:'tasks_1', title:'First Step', desc:'Complete your first task', icon:'🌟', rarity:'common', xp:50 },
  { type:'tasks_5', title:'Getting Started', desc:'Complete 5 tasks', icon:'⭐', rarity:'common', xp:100 },
  { type:'tasks_10', title:'Task Warrior', desc:'Complete 10 tasks', icon:'⚔️', rarity:'rare', xp:150 },
  { type:'tasks_25', title:'Productivity Master', desc:'Complete 25 tasks', icon:'🏆', rarity:'epic', xp:300 },
  { type:'tasks_50', title:'Legend', desc:'Complete 50 tasks', icon:'👑', rarity:'legendary', xp:500 },
  { type:'tasks_100', title:'Unstoppable', desc:'Complete 100 tasks', icon:'🦁', rarity:'legendary', xp:1000 },
]

export function AchievementsPage() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { achievementsApi.getAll().then(r => setAchievements(r.data.achievements)).finally(() => setLoading(false)) }, [])

  const unlockedTypes = new Set(achievements.map(a => a.type))
  const xpProgress = Math.min(((user?.xp||0) % 100), 100)

  return (
    <div className="space-y-6">
      <div><h1 className="page-title">Achievements</h1><p className="page-subtitle">Track your milestones and earn rewards</p></div>
      <motion.div className="glass-card p-6 relative overflow-hidden" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ background:'linear-gradient(135deg,#a855f7,#f59e0b)' }} />
        <div className="relative flex items-center gap-5 flex-wrap">
          <motion.div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 relative" style={{ background:'linear-gradient(135deg,#a855f7,#f59e0b)' }} animate={{ rotate:[0,3,-3,0] }} transition={{ duration:3,repeat:Infinity }}>
            <span className="text-3xl">👑</span>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-800 border-2 border-amber-400 flex items-center justify-center"><span className="text-xs font-bold font-display text-amber-400">{user?.level}</span></div>
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1"><h2 className="font-display text-xl font-bold text-white">Level {user?.level||1}</h2><span className="badge-amber">{user?.xp||0} XP total</span></div>
            <p className="text-xs text-white/35 font-body mb-3">{100-xpProgress} XP to Level {(user?.level||1)+1}</p>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background:'linear-gradient(90deg,#a855f7,#f59e0b)' }} initial={{ width:0 }} animate={{ width:`${xpProgress}%` }} transition={{ duration:1.5 }}/></div>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-4 text-center">
            {[{l:'Badges',v:achievements.length,icon:<Trophy size={15} className="text-amber-400"/>},{l:'Streak',v:user?.streak||0,icon:<Flame size={15} className="text-orange-400"/>},{l:'Tasks',v:user?.totalTasksCompleted||0,icon:<Zap size={15} className="text-purple-400"/>}].map(x=><div key={x.l}><div className="flex justify-center mb-1">{x.icon}</div><p className="font-display text-xl font-bold text-white">{x.v}</p><p className="text-xs text-white/25 font-body">{x.l}</p></div>)}
          </div>
        </div>
      </motion.div>

      {achievements.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-white text-sm mb-3">🏆 Unlocked ({achievements.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((a,i) => (
              <motion.div key={a._id} className="rounded-2xl p-4 border relative overflow-hidden" style={{ background:`${RCOLORS[a.rarity]}0d`, borderColor:`${RCOLORS[a.rarity]}28` }} initial={{ opacity:0,scale:0.92 }} animate={{ opacity:1,scale:1 }} transition={{ delay:i*0.05 }} whileHover={{ scale:1.02,y:-2 }}>
                <div className="absolute top-2 right-3"><span className={`${RARITY[a.rarity]} text-xs capitalize`}>{a.rarity}</span></div>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{a.icon}</span>
                  <div><p className="font-display font-bold text-white text-sm">{a.title}</p><p className="text-xs text-white/35 font-body mt-0.5">{a.description}</p><div className="flex items-center gap-2 mt-2"><span className="text-xs font-body flex items-center gap-1" style={{ color:RCOLORS[a.rarity] }}><Zap size={10}/>+{a.xpReward} XP</span><span className="text-xs text-white/20 font-body">{formatDistanceToNow(new Date(a.unlockedAt),{addSuffix:true})}</span></div></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display font-semibold text-white/40 text-sm mb-3">🔒 Locked</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL.filter(a => !unlockedTypes.has(a.type)).map((a,i) => (
            <motion.div key={a.type} className="rounded-2xl p-4 border border-white/5 bg-white/2 opacity-45" initial={{ opacity:0 }} animate={{ opacity:0.45 }} transition={{ delay:i*0.04 }}>
              <div className="flex items-start gap-3"><span className="text-3xl grayscale">{a.icon}</span><div><p className="font-display font-bold text-white/50 text-sm">{a.title}</p><p className="text-xs text-white/25 font-body mt-0.5">{a.desc}</p><div className="flex items-center gap-2 mt-2"><span className="text-xs text-white/20 font-body capitalize">{a.rarity}</span><span className="text-xs text-white/20 font-body">+{a.xp} XP</span></div></div></div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ProfilePage
import { profileApi, authApi } from '../../services/api'
import toast from 'react-hot-toast'
import { Save, Edit2, Camera, Lock, User, Building, BookOpen, Calendar as Cal } from 'lucide-react'

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  const [form, setForm] = useState({ name:user?.name||'', studentId:user?.studentId||'', institution:user?.institution||'', major:user?.major||'', year:user?.year||'', bio:user?.bio||'', avatar:user?.avatar||'' })
  const [passForm, setPassForm] = useState({ currentPassword:'', newPassword:'', confirm:'' })
  const [loading, setLoading] = useState(false)
  const [avatarPrev, setAvatarPrev] = useState(user?.avatar||'')
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleAvatar = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { setAvatarPrev(ev.target.result); setForm(p => ({ ...p, avatar:ev.target.result })) }; r.readAsDataURL(f) }

  const save = async () => { setLoading(true); try { const r = await profileApi.update({ ...form, avatar:avatarPrev }); updateUser(r.data.user); toast.success('Profile updated! ✅'); setEditing(false) } catch { toast.error('Failed to update') } finally { setLoading(false) } }

  const changePass = async (e) => { e.preventDefault(); if (passForm.newPassword !== passForm.confirm) return toast.error('Passwords do not match'); if (passForm.newPassword.length < 8) return toast.error('Password too short'); setLoading(true); try { await authApi.changePassword({ currentPassword:passForm.currentPassword, newPassword:passForm.newPassword }); toast.success('Password changed!'); setChangingPass(false); setPassForm({ currentPassword:'', newPassword:'', confirm:'' }) } catch (err) { toast.error(err.response?.data?.message||'Failed') } finally { setLoading(false) } }

  const xpProgress = Math.min(((user?.xp||0) % 100), 100)

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div><h1 className="page-title">Profile</h1><p className="page-subtitle">Manage your student account</p></div>
      <motion.div className="glass-card p-6 text-center" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto gradient-bg">{avatarPrev ? <img src={avatarPrev} alt="Avatar" className="w-full h-full object-cover"/> : <span className="w-full h-full flex items-center justify-center text-4xl font-bold font-display">{user?.name?.[0]}</span>}</div>
          {editing && <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl gradient-bg flex items-center justify-center cursor-pointer"><Camera size={14} className="text-white"/><input type="file" accept="image/*" className="hidden" onChange={handleAvatar}/></label>}
        </div>
        <h2 className="font-display text-xl font-bold text-white mb-0.5">{user?.name}</h2>
        <p className="text-white/35 text-sm font-body">{user?.email}</p>
        {user?.institution && <p className="text-purple-400 text-xs font-body mt-1">{user.institution} · {user?.major}</p>}
        <div className="grid grid-cols-3 gap-4 mt-5">{[{l:'Level',v:user?.level||1,c:'text-purple-400'},{l:'XP',v:user?.xp||0,c:'text-amber-400'},{l:'Streak',v:`${user?.streak||0}🔥`,c:'text-orange-400'}].map(x=><div key={x.l} className="glass rounded-xl p-3"><p className={`font-display text-xl font-bold ${x.c}`}>{x.v}</p><p className="text-xs text-white/25 font-body">{x.l}</p></div>)}</div>
        <div className="mt-4"><div className="flex justify-between mb-1"><span className="text-xs text-white/25 font-body">Level progress</span><span className="text-xs text-purple-400 font-body">{Math.round(xpProgress)}%</span></div><div className="h-2 rounded-full bg-white/8 overflow-hidden"><motion.div className="h-full rounded-full gradient-bg" initial={{ width:0 }} animate={{ width:`${xpProgress}%` }} transition={{ duration:1.5 }}/></div></div>
      </motion.div>

      <motion.div className="glass-card p-5" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
        <div className="flex items-center justify-between mb-5"><h3 className="font-display font-semibold text-white">Personal Info</h3><motion.button onClick={editing ? save : () => setEditing(true)} className={editing ? 'btn-primary text-sm' : 'btn-secondary text-sm'} disabled={loading} whileHover={{ scale:1.02 }}>{editing ? <><Save size={14}/>{loading?'Saving...':'Save'}</> : <><Edit2 size={14}/>Edit</>}</motion.button></div>
        <div className="space-y-4">
          {[['name','Full Name',User,'Your name'],['studentId','Student ID',User,'e.g. STU123456'],['institution','Institution',Building,'University/School'],['major','Major',BookOpen,'Field of study'],['year','Year',Cal,'e.g. 3rd Year']].map(([k,l,Icon,ph]) => (
            <div key={k}><label className="label">{l}</label><div className="relative"><Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"/><input placeholder={ph} value={form[k]} onChange={set(k)} disabled={!editing} className={`input pl-10 text-sm ${!editing?'opacity-55 cursor-not-allowed':''}`}/></div></div>
          ))}
          <div><label className="label">Bio</label><textarea placeholder="Tell us about yourself..." value={form.bio} onChange={set('bio')} disabled={!editing} rows={3} className={`input text-sm resize-none ${!editing?'opacity-55 cursor-not-allowed':''}`}/></div>
        </div>
        {editing && <button onClick={() => setEditing(false)} className="btn-secondary text-sm w-full mt-3">Cancel</button>}
      </motion.div>

      <motion.div className="glass-card p-5" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}>
        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Lock size={15} className="text-purple-400"/><h3 className="font-display font-semibold text-white">Change Password</h3></div><button className="btn-secondary text-sm" onClick={() => setChangingPass(!changingPass)}>{changingPass?'Cancel':'Change'}</button></div>
        {changingPass && (
          <motion.form onSubmit={changePass} className="space-y-3" initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }}>
            {[['currentPassword','Current password'],['newPassword','New password (8+ chars)'],['confirm','Confirm password']].map(([k,ph]) => <input key={k} type="password" placeholder={ph} className="input text-sm" value={passForm[k]} onChange={e => setPassForm(p => ({ ...p, [k]:e.target.value }))} required/>)}
            <motion.button type="submit" className="btn-primary w-full text-sm" disabled={loading} whileHover={{ scale:1.01 }}>{loading?'Updating...':'Update Password'}</motion.button>
          </motion.form>
        )}
      </motion.div>

      <motion.div className="glass-card p-5" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}>
        <h3 className="font-display font-semibold text-white mb-4">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">{[{l:'Tasks Completed',v:user?.totalTasksCompleted||0,icon:'✅'},{l:'Study Hours',v:`${(user?.studyHours||0).toFixed(1)}h`,icon:'📚'},{l:'Current Streak',v:`${user?.streak||0} days`,icon:'🔥'},{l:'Member Since',v:user?.createdAt?new Date(user.createdAt).toLocaleDateString('en-US',{month:'short',year:'numeric'}):'—',icon:'📅'}].map(x=><div key={x.l} className="rounded-xl p-4 text-center" style={{ background:'rgba(255,255,255,0.03)' }}><span className="text-2xl">{x.icon}</span><p className="font-display text-lg font-bold text-white mt-1">{x.v}</p><p className="text-xs text-white/25 font-body">{x.l}</p></div>)}</div>
      </motion.div>
    </div>
  )
}

export { AchievementsPage as default }

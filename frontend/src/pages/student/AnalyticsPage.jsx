// AnalyticsPage.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { analyticsApi } from '../../services/api'
import { StatCard, GridSkeleton } from '../../components/ui/index'

const COLORS = ['#a855f7','#3b82f6','#10b981','#f59e0b','#ec4899','#06b6d4']
const PCOL = { low:'#10b981', medium:'#f59e0b', high:'#f97316', urgent:'#ef4444' }
const TS = { contentStyle: { background:'rgba(10,10,20,0.95)', border:'1px solid rgba(168,85,247,0.25)', borderRadius:12, fontFamily:'DM Sans', fontSize:12, color:'#fff' } }

export function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { analyticsApi.get().then(r => setData(r.data.data)).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="space-y-5"><GridSkeleton cols={4} height={28} /><div className="grid grid-cols-2 gap-4"><div className="glass-card h-56 animate-pulse" /><div className="glass-card h-56 animate-pulse" /></div></div>

  const s = data?.summary || {}
  return (
    <div className="space-y-5">
      <div><h1 className="page-title">Analytics</h1><p className="page-subtitle">Your productivity insights</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tasks Done" value={s.completed||0} icon="✅" gradient="linear-gradient(135deg,#10b981,#06b6d4)" subtitle={`${s.completionRate||0}% rate`} delay={0.05} />
        <StatCard title="XP Earned" value={s.xp||0} icon="⚡" gradient="linear-gradient(135deg,#a855f7,#3b82f6)" subtitle={`Level ${s.level||1}`} delay={0.1} />
        <StatCard title="Study Hours" value={`${(s.studyHours||0).toFixed(1)}h`} icon="📚" gradient="linear-gradient(135deg,#3b82f6,#06b6d4)" delay={0.15} />
        <StatCard title="Day Streak" value={s.streak||0} icon="🔥" gradient="linear-gradient(135deg,#f59e0b,#f97316)" delay={0.2} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display font-semibold text-white text-sm mb-1">Weekly Activity</h3><p className="text-xs text-white/30 font-body mb-4">Completed vs Created</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data?.weeklyData||[]}>
              <defs><linearGradient id="aw1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient><linearGradient id="aw2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="day" tick={{ fill:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'DM Sans' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'rgba(255,255,255,0.25)', fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip {...TS}/><Legend wrapperStyle={{ fontSize:12, fontFamily:'DM Sans', color:'rgba(255,255,255,0.4)' }}/>
              <Area type="monotone" dataKey="completed" stroke="#a855f7" fill="url(#aw1)" strokeWidth={2} name="Completed"/>
              <Area type="monotone" dataKey="created" stroke="#3b82f6" fill="url(#aw2)" strokeWidth={2} name="Created"/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h3 className="font-display font-semibold text-white text-sm mb-1">Subject Performance</h3><p className="text-xs text-white/30 font-body mb-4">Completed by subject</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data?.subjectData||[]} layout="vertical">
              <XAxis type="number" tick={{ fill:'rgba(255,255,255,0.25)', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis dataKey="subject" type="category" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11, fontFamily:'DM Sans' }} axisLine={false} tickLine={false} width={65}/>
              <Tooltip {...TS}/><Bar dataKey="completed" fill="#a855f7" radius={[0,6,6,0]} name="Completed"/><Bar dataKey="total" fill="rgba(168,85,247,0.12)" radius={[0,6,6,0]} name="Total"/>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-display font-semibold text-white text-sm mb-4">Priority Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={150}>
              <PieChart><Pie data={(data?.priorityData||[]).filter(p=>p.count>0)} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="count" nameKey="priority" stroke="none">{(data?.priorityData||[]).map(p=><Cell key={p.priority} fill={PCOL[p.priority]}/>)}</Pie><Tooltip {...TS}/></PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">{(data?.priorityData||[]).map(p=><div key={p.priority} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: PCOL[p.priority] }}/><span className="text-xs text-white/45 capitalize font-body">{p.priority}</span></div><span className="text-xs font-bold font-display text-white">{p.count}</span></div>)}</div>
          </div>
        </motion.div>
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 className="font-display font-semibold text-white text-sm mb-4">Study Hours by Subject</h3>
          {(data?.studyData||[]).length===0 ? <div className="flex items-center justify-center h-32 text-white/20 text-sm font-body">No study sessions logged</div> : (
            <div className="space-y-3">{(data.studyData).map((s,i)=>{const max=Math.max(...data.studyData.map(x=>x.hours)); return(<div key={s.subject}><div className="flex items-center justify-between mb-1"><span className="text-xs text-white/55 font-body">{s.subject}</span><span className="text-xs text-white/35 font-body">{s.hours.toFixed(1)}h</span></div><div className="h-1.5 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: COLORS[i%COLORS.length] }} initial={{ width:0 }} animate={{ width:`${max>0?(s.hours/max)*100:0}%` }} transition={{ duration:1, delay:i*0.1 }}/></div></div>)})}</div>
          )}
        </motion.div>
      </div>
      <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="font-display font-semibold text-white text-sm mb-1">30-Day Completion Trend</h3><p className="text-xs text-white/30 font-body mb-4">Tasks completed over the past month</p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={data?.monthlyData||[]}>
            <defs><linearGradient id="am1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="date" tick={{ fill:'rgba(255,255,255,0.2)', fontSize:10, fontFamily:'DM Sans' }} axisLine={false} tickLine={false} interval={2}/>
            <YAxis tick={{ fill:'rgba(255,255,255,0.2)', fontSize:10 }} axisLine={false} tickLine={false}/>
            <Tooltip {...TS}/><Area type="monotone" dataKey="count" stroke="#06b6d4" fill="url(#am1)" strokeWidth={2} name="Completed"/>
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
export default AnalyticsPage

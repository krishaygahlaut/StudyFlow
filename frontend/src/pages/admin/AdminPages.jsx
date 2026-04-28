import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Users, Shield, FileText, Activity, Search, ArrowRight, ArrowLeft, Trash2, Edit2, Check, X, AlertTriangle, Plus, Send } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { adminApi } from '../../services/api'
import { StatCard, TableSkeleton, EmptyState, GridSkeleton } from '../../components/ui/index'
import toast from 'react-hot-toast'

const tooltipStyle = { contentStyle: { background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 12, fontFamily: 'DM Sans', fontSize: 12, color: '#fff' } }

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [data, setData] = useState(null)
  const [sysStats, setSysStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [broadcastModal, setBroadcastModal] = useState(false)
  const [broadcast, setBroadcast] = useState({ title: '', message: '', role: 'all', icon: '📢' })

  useEffect(() => {
    Promise.all([adminApi.getDashboard(), adminApi.getSystemStats()])
      .then(([dRes, sRes]) => { setData(dRes.data.data); setSysStats(sRes.data.stats) })
      .finally(() => setLoading(false))
  }, [])

  const sendBroadcast = async () => {
    if (!broadcast.title || !broadcast.message) return toast.error('Title and message required')
    try {
      const res = await adminApi.broadcast(broadcast)
      toast.success(res.data.message)
      setBroadcastModal(false)
      setBroadcast({ title: '', message: '', role: 'all', icon: '📢' })
    } catch { toast.error('Broadcast failed') }
  }

  if (loading) return <div className="space-y-6"><GridSkeleton cols={4} height={28} /><div className="glass-card h-64 animate-pulse" /></div>

  const s = data?.stats || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div className="glass-card p-6 relative overflow-hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-bg-red flex items-center justify-center text-2xl">🛡️</div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Admin Control Panel</h2>
              <p className="text-white/40 text-sm font-body">System Overview & Management</p>
            </div>
          </div>
          <button onClick={() => setBroadcastModal(true)} className="btn-primary text-sm"><Send size={14} />Broadcast</button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={s.totalUsers || 0} icon="👥" gradient="linear-gradient(135deg, #a855f7, #3b82f6)" delay={0.05} />
        <StatCard title="Students" value={s.totalStudents || 0} icon="🎓" gradient="linear-gradient(135deg, #3b82f6, #06b6d4)" delay={0.1} />
        <StatCard title="Faculty" value={s.totalFaculty || 0} icon="👨‍🏫" gradient="linear-gradient(135deg, #06b6d4, #10b981)" delay={0.15} />
        <StatCard title="Active Today" value={s.activeToday || 0} icon="⚡" gradient="linear-gradient(135deg, #f59e0b, #f97316)" delay={0.2} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={s.totalTasks || 0} icon="📋" gradient="linear-gradient(135deg, #a855f7, #3b82f6)" delay={0.05} />
        <StatCard title="Completed" value={s.completedTasks || 0} icon="✅" gradient="linear-gradient(135deg, #10b981, #06b6d4)" subtitle={`${s.completionRate || 0}% rate`} delay={0.1} />
        <StatCard title="Overdue" value={s.overdueTasks || 0} icon="🚨" gradient="linear-gradient(135deg, #ef4444, #f97316)" delay={0.15} />
        <StatCard title="Study Sessions" value={s.totalSessions || 0} icon="📚" gradient="linear-gradient(135deg, #8b5cf6, #a855f7)" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User growth chart */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h3 className="font-display font-semibold text-white text-sm mb-1">User Registrations</h3>
          <p className="text-xs text-white/30 font-body mb-4">Last 7 days</p>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={data?.userGrowth || []}>
              <defs><linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} /><stop offset="95%" stopColor="#a855f7" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#a855f7" fill="url(#ag1)" strokeWidth={2} name="Registrations" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* System stats */}
        {sysStats && (
          <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="font-display font-semibold text-white text-sm mb-4">System Health</h3>
            <div className="space-y-3">
              {[
                { label: 'Node.js', value: sysStats.server?.nodeVersion },
                { label: 'Uptime', value: sysStats.server?.uptime },
                { label: 'Heap Used', value: sysStats.server?.memoryUsage?.heapUsed },
                { label: 'DB Size', value: sysStats.database?.dataSize },
                { label: 'Collections', value: sysStats.database?.collections },
                { label: 'Indexes', value: sysStats.database?.indexes },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-xs text-white/35 font-body">{item.label}</span>
                  <span className="text-xs font-mono text-emerald-400">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent audit logs */}
      <motion.div className="glass-card overflow-hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="font-display font-semibold text-white text-sm">Recent Activity</h3>
          <Link to="/admin/audit-logs" className="text-xs text-purple-400 hover:text-purple-300 font-body flex items-center gap-1">View all <ArrowRight size={11} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>User</th><th>Action</th><th>Resource</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              {(data?.recentLogs || []).map((log, i) => (
                <tr key={log._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center text-xs font-bold text-white">{log.actor?.name?.[0]?.toUpperCase()}</div>
                      <span className="text-xs font-body">{log.actor?.name}</span>
                      <span className={`badge-${log.actorRole === 'admin' ? 'red' : log.actorRole === 'faculty' ? 'cyan' : 'blue'} text-xs`}>{log.actorRole}</span>
                    </div>
                  </td>
                  <td><span className="text-xs font-mono text-purple-400">{log.action}</span></td>
                  <td><span className="text-xs text-white/40 font-body">{log.resource}</span></td>
                  <td><span className="text-xs text-white/30 font-body">{new Date(log.createdAt).toLocaleTimeString()}</span></td>
                  <td><span className={`badge-${log.success ? 'green' : 'red'} text-xs`}>{log.success ? '✓' : '✗'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Broadcast modal */}
      <AnimatePresence>
        {broadcastModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setBroadcastModal(false)} />
            <motion.div className="relative z-10 w-full max-w-md glass-dark rounded-2xl border border-white/10 p-6" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="font-display font-bold text-white mb-5">Broadcast Notification</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Target Audience</label>
                  <select className="input text-sm" value={broadcast.role} onChange={e => setBroadcast(p => ({ ...p, role: e.target.value }))}>
                    <option value="all" className="bg-dark-700">All Users</option>
                    <option value="student" className="bg-dark-700">Students Only</option>
                    <option value="faculty" className="bg-dark-700">Faculty Only</option>
                  </select>
                </div>
                <div>
                  <label className="label">Title</label>
                  <input placeholder="Notification title" className="input text-sm" value={broadcast.title} onChange={e => setBroadcast(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea placeholder="Write your message..." className="input text-sm resize-none h-24" value={broadcast.message} onChange={e => setBroadcast(p => ({ ...p, message: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setBroadcastModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <motion.button onClick={sendBroadcast} className="btn-primary flex-1 text-sm" whileHover={{ scale: 1.01 }}><Send size={14} />Send Broadcast</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Admin Users ──────────────────────────────────────────────────────────────
export function AdminUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})
  const [facultyModal, setFacultyModal] = useState(false)
  const [newFaculty, setNewFaculty] = useState({ name: '', email: '', department: '', designation: '' })

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getUsers({ search, role, page, limit: 20, sort: '-createdAt' })
      setUsers(res.data.users)
      setMeta({ total: res.data.total, pages: res.data.pages })
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [search, role, page])

  useEffect(() => { fetch() }, [role, page])
  useEffect(() => { const t = setTimeout(fetch, 350); return () => clearTimeout(t) }, [search])

  const toggleActive = async (user) => {
    try {
      await adminApi.updateUser(user._id, { isActive: !user.isActive })
      toast.success(user.isActive ? 'User deactivated' : 'User activated')
      fetch()
    } catch { toast.error('Failed to update') }
  }

  const deleteUser = async (id) => {
    if (!confirm('Deactivate this user? This action can be reversed.')) return
    try { await adminApi.deleteUser(id); toast.success('User deactivated'); fetch() }
    catch { toast.error('Failed to delete') }
  }

  const createFaculty = async () => {
    if (!newFaculty.name || !newFaculty.email) return toast.error('Name and email required')
    try {
      const res = await adminApi.createFaculty(newFaculty)
      toast.success(`Faculty created! Temp password: ${res.data.tempPassword}`, { duration: 8000 })
      setFacultyModal(false)
      setNewFaculty({ name: '', email: '', department: '', designation: '' })
      fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create faculty') }
  }

  const roleColor = { student: 'badge-blue', faculty: 'badge-cyan', admin: 'badge-red' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle">{meta.total || 0} total users</p></div>
        <button onClick={() => setFacultyModal(true)} className="btn-primary text-sm"><Plus size={14} />Create Faculty</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input placeholder="Search name, email, ID, institution..." className="input pl-10 text-sm" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="flex gap-2">
          {[{ l: 'All', v: '' }, { l: '🎓 Students', v: 'student' }, { l: '👨‍🏫 Faculty', v: 'faculty' }, { l: '🛡️ Admin', v: 'admin' }].map(f => (
            <button key={f.v} onClick={() => { setRole(f.v); setPage(1) }}
              className="px-3 py-2 rounded-xl text-xs font-body border transition-all"
              style={role === f.v ? { background: 'rgba(168,85,247,0.18)', borderColor: 'rgba(168,85,247,0.4)', color: '#c084fc' } : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? <TableSkeleton rows={10} /> : users.length === 0 ? <EmptyState type="users" /> : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>User</th><th className="hidden md:table-cell">Institution</th><th>Role</th><th className="hidden lg:table-cell">Tasks</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{u.name?.[0]?.toUpperCase()}</div>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-body truncate">{u.name}</p>
                          <p className="text-xs text-white/30 font-body truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell"><span className="text-sm font-body">{u.institution || '—'}</span></td>
                    <td><span className={roleColor[u.role]}>{u.role}</span></td>
                    <td className="hidden lg:table-cell">
                      <span className="text-sm font-body"><span className="text-emerald-400">{u.taskStats?.completed || 0}</span><span className="text-white/30">/{u.taskStats?.total || 0}</span></span>
                    </td>
                    <td>
                      <button onClick={() => toggleActive(u)} className={`badge cursor-pointer transition-all ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                        {u.isActive ? '● Active' : '● Inactive'}
                      </button>
                    </td>
                    <td><span className="text-xs text-white/30 font-body">{new Date(u.createdAt).toLocaleDateString()}</span></td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Link to={`/admin/users/${u._id}`}><motion.div className="btn-icon" whileHover={{ scale: 1.05 }}><Edit2 size={13} /></motion.div></Link>
                        <motion.button onClick={() => deleteUser(u._id)} className="btn-icon hover:text-red-400" whileHover={{ scale: 1.05 }}><Trash2 size={13} /></motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(meta.pages || 1) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-white/30 font-body">Page {page} of {meta.pages} · {meta.total} users</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-sm glass text-xs disabled:opacity-30">Previous</button>
              <button disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)} className="btn-sm glass text-xs disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create Faculty Modal */}
      <AnimatePresence>
        {facultyModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFacultyModal(false)} />
            <motion.div className="relative z-10 w-full max-w-md glass-dark rounded-2xl border border-white/10 p-6" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="font-display font-bold text-white mb-5">Create Faculty Account</h3>
              <div className="space-y-4">
                {[['name','Full Name','Alex Smith'],['email','Email Address','alex@university.edu'],['department','Department','Computer Science'],['designation','Designation','Associate Professor']].map(([k,l,p]) => (
                  <div key={k}><label className="label">{l}</label><input placeholder={p} className="input text-sm" value={newFaculty[k]} onChange={e => setNewFaculty(prev => ({ ...prev, [k]: e.target.value }))} /></div>
                ))}
                <div className="px-3 py-2.5 rounded-xl text-xs text-white/50 font-body" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  ⚠️ A temporary password will be generated and shown to you after creation. The faculty member should change it immediately upon login.
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setFacultyModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <motion.button onClick={createFaculty} className="btn-primary flex-1 text-sm" whileHover={{ scale: 1.01 }}>Create Faculty</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Admin User Detail ────────────────────────────────────────────────────────
export function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    adminApi.getUser(id).then(r => { setUserData(r.data); setForm({ name: r.data.user.name, email: r.data.user.email, role: r.data.user.role, institution: r.data.user.institution || '', major: r.data.user.major || '', year: r.data.user.year || '', department: r.data.user.department || '', designation: r.data.user.designation || '', isActive: r.data.user.isActive, isEmailVerified: r.data.user.isEmailVerified }) }).finally(() => setLoading(false))
  }, [id])

  const save = async () => {
    try { await adminApi.updateUser(id, form); toast.success('User updated'); setEditing(false); const r = await adminApi.getUser(id); setUserData(r.data) }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
  }

  if (loading) return <div className="space-y-4"><div className="glass-card h-48 animate-pulse" /><div className="glass-card h-64 animate-pulse" /></div>
  if (!userData) return <div className="text-center py-20 text-white/30">User not found</div>

  const { user, tasks } = userData

  return (
    <div className="space-y-5">
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors font-body"><ArrowLeft size={14} /> Back to Users</Link>

      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-2xl font-bold text-white">{user.name?.[0]?.toUpperCase()}</div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">{user.name}</h2>
              <p className="text-white/40 font-body text-sm">{user.email}</p>
              <div className="flex gap-2 mt-1">
                <span className={`badge-${user.role === 'admin' ? 'red' : user.role === 'faculty' ? 'cyan' : 'blue'}`}>{user.role}</span>
                <span className={`badge-${user.isActive ? 'green' : 'red'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                <span className={`badge-${user.isEmailVerified ? 'green' : 'amber'}`}>{user.isEmailVerified ? 'Verified' : 'Unverified'}</span>
              </div>
            </div>
          </div>
          <button onClick={() => editing ? save() : setEditing(true)} className={editing ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>
            {editing ? <><Check size={14} />Save</> : <><Edit2 size={14} />Edit</>}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['name', 'Full Name'], ['email', 'Email'],
            ['role', 'Role', ['student', 'faculty', 'admin']], ['institution', 'Institution'],
            ['major', 'Major / Department'], ['year', 'Year'],
            ['department', 'Department'], ['designation', 'Designation'],
          ].map(([k, l, opts]) => (
            <div key={k}>
              <label className="label">{l}</label>
              {opts ? (
                <select className="input text-sm" value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} disabled={!editing}>
                  {opts.map(o => <option key={o} value={o} className="bg-dark-700">{o}</option>)}
                </select>
              ) : (
                <input className={`input text-sm ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`} value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} disabled={!editing} />
              )}
            </div>
          ))}
          <div className="flex items-center gap-4">
            {[['isActive', 'Active'], ['isEmailVerified', 'Email Verified']].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[k] || false} onChange={e => setForm(p => ({ ...p, [k]: e.target.checked }))} disabled={!editing} className="w-4 h-4" />
                <span className="text-sm text-white/60 font-body">{l}</span>
              </label>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div className="glass-card overflow-hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-display font-semibold text-white text-sm">Recent Tasks ({tasks?.length || 0})</h3>
        </div>
        <div className="divide-y divide-white/4">
          {(tasks || []).slice(0, 10).map(task => (
            <div key={task._id} className="flex items-center gap-3 px-5 py-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: { low: '#10b981', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' }[task.priority] }} />
              <p className="text-sm text-white font-body flex-1 truncate">{task.title}</p>
              <span className={`status-${task.status} flex-shrink-0`}>{task.status}</span>
              <span className="text-xs text-white/25 font-body flex-shrink-0">{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          ))}
          {(tasks?.length || 0) === 0 && <p className="text-center text-white/25 text-sm font-body py-6">No tasks</p>}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Admin Audit Logs ─────────────────────────────────────────────────────────
export function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getAuditLogs({ page, limit: 30 })
      setLogs(res.data.logs)
      setMeta({ total: res.data.total, pages: res.data.pages })
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetch() }, [fetch])

  return (
    <div className="space-y-5">
      <div><h1 className="page-title">Audit Logs</h1><p className="page-subtitle">Complete activity trail of all system actions</p></div>

      <div className="table-wrapper">
        {loading ? <TableSkeleton rows={12} /> : logs.length === 0 ? <EmptyState type="logs" /> : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Actor</th><th>Action</th><th>Resource</th><th className="hidden lg:table-cell">IP</th><th>Time</th><th>Result</th></tr></thead>
              <tbody>
                {logs.map((log, i) => (
                  <motion.tr key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center text-xs font-bold text-white">{log.actor?.name?.[0]?.toUpperCase() || '?'}</div>
                        <div><p className="text-xs text-white font-body">{log.actor?.name || 'Unknown'}</p><span className={`badge-${log.actorRole === 'admin' ? 'red' : log.actorRole === 'faculty' ? 'cyan' : 'blue'} text-xs`}>{log.actorRole}</span></div>
                      </div>
                    </td>
                    <td><span className="text-xs font-mono text-purple-300">{log.action}</span></td>
                    <td><span className="text-xs text-white/40 font-body">{log.resource}</span></td>
                    <td className="hidden lg:table-cell"><span className="text-xs font-mono text-white/25">{log.ip}</span></td>
                    <td><span className="text-xs text-white/30 font-body">{new Date(log.createdAt).toLocaleString()}</span></td>
                    <td><span className={`badge-${log.success ? 'green' : 'red'}`}>{log.success ? 'Success' : 'Failed'}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(meta.pages || 1) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-white/30 font-body">Page {page} of {meta.pages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-sm glass text-xs disabled:opacity-30">Previous</button>
              <button disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)} className="btn-sm glass text-xs disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

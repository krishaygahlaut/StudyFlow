import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Pin, Trash2, Edit2, Check, X } from 'lucide-react'
import { notesApi } from '../../services/api'
import { EmptyState } from '../../components/ui/index'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const COLORS = ['#6366f1','#a855f7','#ec4899','#f59e0b','#10b981','#3b82f6','#06b6d4','#f97316']

function NoteCard({ note, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: note.title, content: note.content })

  const save = async () => {
    try { const r = await notesApi.update(note._id, form); onUpdate(r.data.note); setEditing(false); toast.success('Saved!') }
    catch { toast.error('Failed to save') }
  }
  const pin = async () => { try { const r = await notesApi.update(note._id, { pinned: !note.pinned }); onUpdate(r.data.note) } catch {} }
  const del = async () => { if (!confirm('Delete this note?')) return; try { await notesApi.delete(note._id); onDelete(note._id); toast.success('Deleted') } catch { toast.error('Failed') } }

  return (
    <motion.div layout className="rounded-2xl p-4 border flex flex-col group" style={{ background: `${note.color}0d`, borderColor: `${note.color}25`, minHeight: 170 }} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} whileHover={{ y: -2 }}>
      {note.pinned && <div className="absolute -top-1.5 left-4 w-3 h-3 rounded-full" style={{ background: note.color }} />}
      <div className="flex items-center justify-between mb-3">
        {editing ? <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="bg-transparent text-sm font-semibold text-white outline-none border-b border-white/20 flex-1 mr-2 pb-0.5" autoFocus /> : <h3 className="font-display text-sm font-semibold text-white flex-1 truncate">{note.title}</h3>}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={pin} className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors" style={{ background: note.pinned ? `${note.color}25` : 'rgba(255,255,255,0.05)' }}><Pin size={11} style={{ color: note.pinned ? note.color : 'rgba(255,255,255,0.35)' }} /></button>
          {editing ? <button onClick={save} className="w-6 h-6 rounded-lg flex items-center justify-center bg-emerald-500/20"><Check size={11} className="text-emerald-400" /></button> : <button onClick={() => setEditing(true)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10"><Edit2 size={11} className="text-white/35" /></button>}
          <button onClick={del} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-400/20"><Trash2 size={11} className="text-white/35 hover:text-red-400" /></button>
        </div>
      </div>
      {editing ? <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="flex-1 bg-transparent text-xs text-white/55 outline-none resize-none font-body leading-relaxed" rows={5} /> : <p className="text-xs text-white/45 font-body leading-relaxed flex-1 line-clamp-5 whitespace-pre-wrap">{note.content || 'No content'}</p>}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
        {note.subject && <span className="text-xs font-body" style={{ color: note.color }}>{note.subject}</span>}
        <span className="text-xs text-white/15 font-body ml-auto">{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
      </div>
    </motion.div>
  )
}

function NewNoteModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', content: '', subject: '', color: '#6366f1', tags: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title required')
    setLoading(true)
    try {
      const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] }
      const r = await notesApi.create(data); onSave(r.data.note); toast.success('Note created! 📝'); onClose()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative z-10 w-full max-w-md glass-dark rounded-2xl border border-white/10" initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5"><h2 className="font-display font-bold text-white">New Note</h2><button onClick={onClose} className="text-white/30 hover:text-white text-lg">×</button></div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div><label className="label">Title *</label><input placeholder="Note title" required className="input text-sm" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div><label className="label">Content</label><textarea placeholder="Write your note..." className="input text-sm resize-none h-28" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Subject</label><input placeholder="CS 101" className="input text-sm" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
            <div><label className="label">Tags</label><input placeholder="math, exam" className="input text-sm" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} /></div>
          </div>
          <div><label className="label">Color</label><div className="flex gap-2 flex-wrap">{COLORS.map(c => <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))} className="w-7 h-7 rounded-lg transition-all" style={{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />)}</div></div>
          <div className="flex gap-3"><button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button><motion.button type="submit" className="btn-primary flex-1 text-sm" disabled={loading} whileHover={{ scale: 1.01 }}>{loading ? 'Creating...' : 'Create Note'}</motion.button></div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export function NotesPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)

  const fetch = async () => { try { const r = await notesApi.getAll({ search }); setNotes(r.data.notes) } finally { setLoading(false) } }
  useEffect(() => { fetch() }, [])
  useEffect(() => { const t = setTimeout(fetch, 350); return () => clearTimeout(t) }, [search])

  const pinned = notes.filter(n => n.pinned), others = notes.filter(n => !n.pinned)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Notes</h1><p className="page-subtitle">{notes.length} notes · {pinned.length} pinned</p></div>
        <motion.button className="btn-primary text-sm" onClick={() => setModal(true)} whileHover={{ scale: 1.02 }}><Plus size={15} /><span className="hidden sm:inline">New Note</span></motion.button>
      </div>
      <div className="relative"><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" /><input placeholder="Search notes..." className="input pl-10 text-sm" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="glass-card h-44 animate-pulse" />)}</div> : notes.length === 0 ? <EmptyState type="notes" action={() => setModal(true)} actionLabel="+ Create Note" /> : (
        <>
          {pinned.length > 0 && <div><p className="text-xs text-white/30 font-body mb-3 flex items-center gap-1.5"><Pin size={11} />Pinned</p><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><AnimatePresence>{pinned.map(n => <NoteCard key={n._id} note={n} onUpdate={u => setNotes(p => p.map(x => x._id === u._id ? u : x))} onDelete={id => setNotes(p => p.filter(x => x._id !== id))} />)}</AnimatePresence></div></div>}
          {others.length > 0 && <div>{pinned.length > 0 && <p className="text-xs text-white/25 font-body mb-3">Others</p>}<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><AnimatePresence>{others.map(n => <NoteCard key={n._id} note={n} onUpdate={u => setNotes(p => p.map(x => x._id === u._id ? u : x))} onDelete={id => setNotes(p => p.filter(x => x._id !== id))} />)}</AnimatePresence></div></div>}
        </>
      )}
      <AnimatePresence>{modal && <NewNoteModal onClose={() => setModal(false)} onSave={n => setNotes(p => [n, ...p])} />}</AnimatePresence>
    </div>
  )
}
export default NotesPage

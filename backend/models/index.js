const mongoose = require('mongoose');

// ─── Note ───────────────────────────────────────────────────────────────────
const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  content: { type: String, default: '' },
  subject: { type: String, default: 'General', trim: true },
  tags: [{ type: String, trim: true }],
  pinned: { type: Boolean, default: false },
  color: { type: String, default: '#6366f1' },
  archived: { type: Boolean, default: false },
}, { timestamps: true });

NoteSchema.index({ user: 1, pinned: -1, updatedAt: -1 });

// ─── StudySession ────────────────────────────────────────────────────────────
const StudySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String },
  duration: { type: Number, default: 0 },
  goal: { type: String, default: '' },
  notes: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
  mood: { type: String, enum: ['great', 'good', 'okay', 'poor', 'terrible'], default: 'good' },
  weeklyGoalHours: { type: Number, default: 2 },
}, { timestamps: true });

StudySessionSchema.index({ user: 1, date: -1 });

// ─── Achievement ─────────────────────────────────────────────────────────────
const AchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '🏆' },
  xpReward: { type: Number, default: 50 },
  unlockedAt: { type: Date, default: Date.now },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
}, { timestamps: true });

// ─── Notification ─────────────────────────────────────────────────────────────
const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['deadline', 'achievement', 'reminder', 'system', 'streak', 'faculty'], default: 'system' },
  read: { type: Boolean, default: false, index: true },
  taskId: { type: mongoose.Schema.ObjectId, ref: 'Task' },
  icon: { type: String, default: '🔔' },
  actionUrl: { type: String, default: '' },
}, { timestamps: true });

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// ─── AuditLog ─────────────────────────────────────────────────────────────────
const AuditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  actorRole: { type: String },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  success: { type: Boolean, default: true },
}, { timestamps: true });

AuditLogSchema.index({ actor: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, createdAt: -1 });

module.exports = {
  Note: mongoose.model('Note', NoteSchema),
  StudySession: mongoose.model('StudySession', StudySessionSchema),
  Achievement: mongoose.model('Achievement', AchievementSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  AuditLog: mongoose.model('AuditLog', AuditLogSchema),
};

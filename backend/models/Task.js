const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  completedAt: Date,
});

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: [true, 'Task title is required'], trim: true, maxlength: 150 },
  description: { type: String, default: '', maxlength: 1000 },
  subject: { type: String, default: 'General', trim: true, index: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium', index: true },
  status: { type: String, enum: ['todo', 'in-progress', 'completed', 'overdue'], default: 'todo', index: true },
  category: { type: String, enum: ['assignment', 'exam', 'project', 'reading', 'lab', 'presentation', 'other'], default: 'assignment' },
  tags: [{ type: String, trim: true, maxlength: 30 }],
  dueDate: { type: Date, required: [true, 'Due date is required'], index: true },
  estimatedTime: { type: Number, default: 0, min: 0 },
  actualTime: { type: Number, default: 0, min: 0 },
  completedAt: Date,
  order: { type: Number, default: 0 },
  xpReward: { type: Number, default: 10 },
  subtasks: [SubtaskSchema],
  attachments: [{ name: String, url: String, size: Number, type: String }],
  // Faculty can view student tasks
  sharedWithFaculty: { type: Boolean, default: true },
}, { timestamps: true });

// Compound indexes for common queries
TaskSchema.index({ user: 1, status: 1 });
TaskSchema.index({ user: 1, dueDate: 1 });
TaskSchema.index({ user: 1, priority: 1 });
TaskSchema.index({ user: 1, subject: 1 });

// Auto-set overdue and XP reward
TaskSchema.pre('save', function(next) {
  if (this.status !== 'completed' && this.dueDate && new Date(this.dueDate) < new Date()) {
    this.status = 'overdue';
  }
  const xpMap = { low: 5, medium: 10, high: 20, urgent: 30 };
  this.xpReward = xpMap[this.priority] || 10;
  next();
});

module.exports = mongoose.model('Task', TaskSchema);

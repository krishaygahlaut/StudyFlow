const Task = require('../models/Task');
const User = require('../models/User');
const { Note, StudySession, Achievement, Notification } = require('../models/index');

// ─── TASKS ─────────────────────────────────────────────────────────────────

const checkAchievements = async (user, completedCount) => {
  const milestones = [
    { count: 1, title: 'First Step', description: 'Completed your first task!', icon: '🌟', xp: 50, rarity: 'common' },
    { count: 5, title: 'Getting Started', description: 'Completed 5 tasks!', icon: '⭐', xp: 100, rarity: 'common' },
    { count: 10, title: 'Task Warrior', description: 'Completed 10 tasks!', icon: '⚔️', xp: 150, rarity: 'rare' },
    { count: 25, title: 'Productivity Master', description: 'Completed 25 tasks!', icon: '🏆', xp: 300, rarity: 'epic' },
    { count: 50, title: 'Legend', description: 'Completed 50 tasks!', icon: '👑', xp: 500, rarity: 'legendary' },
    { count: 100, title: 'Unstoppable', description: 'Completed 100 tasks!', icon: '🦁', xp: 1000, rarity: 'legendary' },
  ];
  for (const m of milestones) {
    if (completedCount === m.count) {
      const existing = await Achievement.findOne({ user: user._id, type: `tasks_${m.count}` });
      if (!existing) {
        await Achievement.create({ user: user._id, type: `tasks_${m.count}`, title: m.title, description: m.description, icon: m.icon, xpReward: m.xp, rarity: m.rarity });
        user.xp += m.xp;
        user.calculateLevel();
        await user.save({ validateBeforeSave: false });
        await Notification.create({ user: user._id, title: `🏆 ${m.title}`, message: m.description, type: 'achievement', icon: m.icon });
      }
    }
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, category, search, sort, subject } = req.query;
    let query = { user: req.user.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (subject) query.subject = new RegExp(subject, 'i');
    if (search) query.$or = [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }, { tags: { $in: [new RegExp(search, 'i')] } }];

    await Task.updateMany({ user: req.user.id, status: { $in: ['todo', 'in-progress'] }, dueDate: { $lt: new Date() } }, { status: 'overdue' });

    let q = Task.find(query);
    if (sort === 'dueDate') q = q.sort({ dueDate: 1 });
    else if (sort === 'priority') q = q.sort({ priority: -1, dueDate: 1 });
    else if (sort === 'created') q = q.sort({ createdAt: -1 });
    else q = q.sort({ order: 1, dueDate: 1 });

    const tasks = await q;
    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    const task = await Task.create(req.body);

    const due = new Date(task.dueDate);
    const hoursUntilDue = (due - new Date()) / 3600000;
    if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
      await Notification.create({ user: req.user.id, title: '⚠️ Due Soon', message: `"${task.title}" is due within 24 hours!`, type: 'deadline', taskId: task._id, icon: '⏰' });
    }

    res.status(201).json({ success: true, task });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const wasCompleted = task.status === 'completed';
    const willComplete = req.body.status === 'completed';

    if (!wasCompleted && willComplete) req.body.completedAt = new Date();
    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!wasCompleted && willComplete) {
      const user = await User.findById(req.user.id);
      user.xp += task.xpReward;
      user.totalTasksCompleted += 1;
      user.calculateLevel();
      await user.save({ validateBeforeSave: false });
      await checkAchievements(user, user.totalTasksCompleted);
      await Notification.create({ user: req.user.id, title: '✅ Task Complete!', message: `+${task.xpReward} XP earned for "${task.title}"`, type: 'achievement', taskId: task._id, icon: '✅' });
    }

    res.status(200).json({ success: true, task });
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, task });
  } catch (err) { next(err); }
};

// ─── NOTES ─────────────────────────────────────────────────────────────────
exports.getNotes = async (req, res, next) => {
  try {
    const { search, subject } = req.query;
    let query = { user: req.user.id, archived: false };
    if (search) query.$or = [{ title: new RegExp(search, 'i') }, { content: new RegExp(search, 'i') }];
    if (subject) query.subject = subject;
    const notes = await Note.find(query).sort({ pinned: -1, updatedAt: -1 });
    res.status(200).json({ success: true, count: notes.length, notes });
  } catch (err) { next(err); }
};

exports.createNote = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const note = await Note.create(req.body);
    res.status(201).json({ success: true, note });
  } catch (err) { next(err); }
};

exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.status(200).json({ success: true, note });
  } catch (err) { next(err); }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.status(200).json({ success: true, message: 'Note deleted' });
  } catch (err) { next(err); }
};

// ─── ANALYTICS ─────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    await Task.updateMany({ user: userId, status: { $in: ['todo', 'in-progress'] }, dueDate: { $lt: now } }, { status: 'overdue' });

    const allTasks = await Task.find({ user: userId });
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const overdueTasks = allTasks.filter(t => t.status === 'overdue');
    const pendingTasks = allTasks.filter(t => ['todo', 'in-progress'].includes(t.status));
    const upcomingTasks = allTasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) > now && new Date(t.dueDate) < new Date(now.getTime() + 7 * 86400000));

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now); day.setDate(now.getDate() - i);
      const s = new Date(day.setHours(0, 0, 0, 0)), e = new Date(day.setHours(23, 59, 59, 999));
      weeklyData.push({
        day: new Date(s).toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedTasks.filter(t => t.completedAt >= s && t.completedAt <= e).length,
        created: allTasks.filter(t => new Date(t.createdAt) >= s && new Date(t.createdAt) <= e).length,
      });
    }

    const subjectMap = {};
    allTasks.forEach(t => {
      if (!subjectMap[t.subject]) subjectMap[t.subject] = { subject: t.subject, total: 0, completed: 0 };
      subjectMap[t.subject].total++;
      if (t.status === 'completed') subjectMap[t.subject].completed++;
    });

    const sessions = await StudySession.find({ user: userId, completed: true });
    const studyMap = {};
    sessions.forEach(s => {
      if (!studyMap[s.subject]) studyMap[s.subject] = { subject: s.subject, hours: 0 };
      studyMap[s.subject].hours += (s.duration || 0) / 60;
    });

    const monthlyData = [];
    for (let i = 29; i >= 0; i -= 3) {
      const day = new Date(now); day.setDate(now.getDate() - i);
      const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const start = new Date(day.setHours(0, 0, 0, 0)), end = new Date(start.getTime() + 3 * 86400000);
      monthlyData.push({ date: label, count: completedTasks.filter(t => t.completedAt >= start && t.completedAt <= end).length });
    }

    const user = await User.findById(userId);
    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: allTasks.length, completed: completedTasks.length,
          overdue: overdueTasks.length, pending: pendingTasks.length,
          upcoming: upcomingTasks.length,
          completionRate: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0,
          xp: user.xp, level: user.level, streak: user.streak,
          studyHours: sessions.reduce((a, s) => a + (s.duration || 0), 0) / 60,
        },
        weeklyData,
        subjectData: Object.values(subjectMap).sort((a, b) => b.total - a.total).slice(0, 6),
        priorityData: ['low', 'medium', 'high', 'urgent'].map(p => ({ priority: p, count: allTasks.filter(t => t.priority === p).length })),
        studyData: Object.values(studyMap).sort((a, b) => b.hours - a.hours).slice(0, 6),
        monthlyData,
      },
    });
  } catch (err) { next(err); }
};

// ─── STUDY SESSIONS ─────────────────────────────────────────────────────────
exports.getSessions = async (req, res, next) => {
  try {
    const { subject, week } = req.query;
    let query = { user: req.user.id };
    if (subject) query.subject = new RegExp(subject, 'i');
    if (week) { const ws = new Date(week); query.date = { $gte: ws, $lt: new Date(ws.getTime() + 7 * 86400000) }; }
    const sessions = await StudySession.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (err) { next(err); }
};

exports.createSession = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    if (req.body.startTime && req.body.endTime) {
      const [sh, sm] = req.body.startTime.split(':').map(Number);
      const [eh, em] = req.body.endTime.split(':').map(Number);
      req.body.duration = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
    }
    const session = await StudySession.create(req.body);
    if (session.completed && session.duration > 0) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { studyHours: session.duration / 60 } });
    }
    res.status(201).json({ success: true, session });
  } catch (err) { next(err); }
};

exports.updateSession = async (req, res, next) => {
  try {
    if (req.body.startTime && req.body.endTime) {
      const [sh, sm] = req.body.startTime.split(':').map(Number);
      const [eh, em] = req.body.endTime.split(':').map(Number);
      req.body.duration = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
    }
    const session = await StudySession.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.status(200).json({ success: true, session });
  } catch (err) { next(err); }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.status(200).json({ success: true, message: 'Session deleted' });
  } catch (err) { next(err); }
};

exports.getWeeklyGoals = async (req, res, next) => {
  try {
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0, 0, 0, 0);
    const sessions = await StudySession.find({ user: req.user.id, date: { $gte: weekStart, $lt: new Date(weekStart.getTime() + 7 * 86400000) }, completed: true });
    const hours = {};
    sessions.forEach(s => { if (!hours[s.subject]) hours[s.subject] = 0; hours[s.subject] += (s.duration || 0) / 60; });
    res.status(200).json({ success: true, weeklyHours: hours, totalHours: Object.values(hours).reduce((a, b) => a + b, 0) });
  } catch (err) { next(err); }
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked read' });
  } catch (err) { next(err); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
};

// ─── PROFILE ─────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'studentId', 'institution', 'major', 'year', 'bio', 'avatar', 'preferences', 'department', 'designation'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, user: user.toPublicJSON() });
  } catch (err) { next(err); }
};

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
exports.getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ user: req.user.id }).sort({ unlockedAt: -1 });
    res.status(200).json({ success: true, achievements });
  } catch (err) { next(err); }
};

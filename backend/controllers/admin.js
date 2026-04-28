const User = require('../models/User');
const Task = require('../models/Task');
const { Note, StudySession, Achievement, Notification, AuditLog } = require('../models/index');
const { sendFacultyWelcomeEmail } = require('../services/emailService');
const crypto = require('crypto');

// @route GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOf30Days = new Date(now.getTime() - 30 * 86400000);
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    const [
      totalUsers, totalStudents, totalFaculty,
      activeToday, newThisMonth,
      totalTasks, completedTasks, overdueTasks,
      totalNotes, totalSessions,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'faculty', isActive: true }),
      User.countDocuments({ lastActiveDate: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: startOf30Days } }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: 'overdue' }),
      Note.countDocuments(),
      StudySession.countDocuments({ completed: true }),
    ]);

    // User growth (last 7 days)
    const userGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const start = new Date(day.setHours(0, 0, 0, 0));
      const end = new Date(day.setHours(23, 59, 59, 999));
      const count = await User.countDocuments({ createdAt: { $gte: start, $lte: end } });
      userGrowth.push({ day: new Date(start).toLocaleDateString('en-US', { weekday: 'short' }), count });
    }

    // Recent audit logs
    const recentLogs = await AuditLog.find()
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers, totalStudents, totalFaculty,
          activeToday, newThisMonth,
          totalTasks, completedTasks, overdueTasks,
          totalNotes, totalSessions,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        userGrowth,
        recentLogs,
      },
    });
  } catch (err) { next(err); }
};

// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, isActive, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    let query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') },
        { institution: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -passwordResetToken -emailVerificationToken -refreshToken')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedFaculty', 'name email')
        .lean(),
      User.countDocuments(query),
    ]);

    // Add task counts
    const enriched = await Promise.all(users.map(async (u) => {
      const taskCount = await Task.countDocuments({ user: u._id });
      const completedCount = await Task.countDocuments({ user: u._id, status: 'completed' });
      return { ...u, taskStats: { total: taskCount, completed: completedCount } };
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      users: enriched,
    });
  } catch (err) { next(err); }
};

// @route GET /api/admin/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -emailVerificationToken')
      .populate('assignedFaculty', 'name email department');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [tasks, sessions, achievements] = await Promise.all([
      Task.find({ user: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
      StudySession.find({ user: user._id }).sort({ date: -1 }).limit(10).lean(),
      Achievement.find({ user: user._id }).lean(),
    ]);

    res.status(200).json({ success: true, user, tasks, sessions, achievements });
  } catch (err) { next(err); }
};

// @route PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const allowed = ['name', 'email', 'role', 'isActive', 'institution', 'major', 'year', 'department', 'designation', 'studentId', 'isEmailVerified'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    // Prevent demoting last admin
    if (updates.role && updates.role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      const targetUser = await User.findById(req.params.id);
      if (targetUser.role === 'admin' && adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot demote the last admin account.' });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .select('-password -passwordResetToken');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (err) { next(err); }
};

// @route DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    // Soft delete (deactivate) instead of hard delete for data integrity
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'User deactivated successfully' });
  } catch (err) { next(err); }
};

// @route POST /api/admin/faculty
// Admin creates a faculty account with temp password
exports.createFaculty = async (req, res, next) => {
  try {
    const { name, email, department, designation } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    // Generate temp password
    const tempPassword = `Faculty@${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const faculty = await User.create({ name, email, password: tempPassword, role: 'faculty', department, designation, isEmailVerified: true });

    // Send welcome email
    try { await sendFacultyWelcomeEmail(faculty, tempPassword); } catch (e) { console.error('Email failed:', e.message); }

    res.status(201).json({ success: true, message: 'Faculty account created. Temporary password sent via email.', faculty: faculty.toPublicJSON(), tempPassword });
  } catch (err) { next(err); }
};

// @route GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, resource } = req.query;
    let query = {};
    if (action) query.action = new RegExp(action, 'i');
    if (resource) query.resource = resource;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actor', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({ success: true, logs, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};

// @route GET /api/admin/system-stats
exports.getSystemStats = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const dbStats = await mongoose.connection.db.stats();

    res.status(200).json({
      success: true,
      stats: {
        database: {
          collections: dbStats.collections,
          dataSize: (dbStats.dataSize / 1024 / 1024).toFixed(2) + ' MB',
          storageSize: (dbStats.storageSize / 1024 / 1024).toFixed(2) + ' MB',
          indexes: dbStats.indexes,
        },
        server: {
          nodeVersion: process.version,
          uptime: Math.floor(process.uptime()) + 's',
          memoryUsage: {
            heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB',
            heapTotal: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + ' MB',
          },
          environment: process.env.NODE_ENV,
        },
      },
    });
  } catch (err) { next(err); }
};

// @route POST /api/admin/broadcast
exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, role, icon = '📢' } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message required' });

    let userQuery = { isActive: true };
    if (role && role !== 'all') userQuery.role = role;

    const users = await User.find(userQuery).select('_id').lean();
    const notifications = users.map(u => ({ user: u._id, title, message, type: 'system', icon }));
    await Notification.insertMany(notifications);

    res.status(200).json({ success: true, message: `Broadcast sent to ${users.length} users` });
  } catch (err) { next(err); }
};

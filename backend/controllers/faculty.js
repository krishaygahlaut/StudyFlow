const User = require('../models/User');
const Task = require('../models/Task');
const { StudySession, Achievement, Notification } = require('../models/index');
const { sendFacultyWelcomeEmail } = require('../services/emailService');
const crypto = require('crypto');

// @route GET /api/faculty/students
// Get all students assigned to this faculty (or all if admin)
exports.getStudents = async (req, res, next) => {
  try {
    const { search, sort = '-createdAt', page = 1, limit = 20, performance } = req.query;

    let query = { role: 'student', isActive: true };
    if (req.user.role === 'faculty') query.assignedFaculty = req.user._id;

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') },
        { major: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const students = await User.find(query)
      .select('-password -passwordResetToken -emailVerificationToken -refreshToken')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    // Enrich each student with live task stats
    const enriched = await Promise.all(students.map(async (student) => {
      const [tasks, sessions] = await Promise.all([
        Task.find({ user: student._id }).lean(),
        StudySession.find({ user: student._id, completed: true }).lean(),
      ]);

      const completed = tasks.filter(t => t.status === 'completed').length;
      const overdue = tasks.filter(t => t.status === 'overdue').length;
      const pending = tasks.filter(t => ['todo', 'in-progress'].includes(t.status)).length;
      const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
      const studyHours = sessions.reduce((a, s) => a + (s.duration || 0), 0) / 60;

      // Activity score (0-100)
      const activityScore = Math.min(
        Math.round((completed * 3 + studyHours * 2 + (student.streak || 0) * 5) / 2),
        100
      );

      return {
        ...student,
        stats: {
          totalTasks: tasks.length,
          completed,
          overdue,
          pending,
          completionRate,
          studyHours: parseFloat(studyHours.toFixed(1)),
          activityScore,
        },
      };
    }));

    // Filter by performance if requested
    let result = enriched;
    if (performance === 'high') result = enriched.filter(s => s.stats.activityScore >= 70);
    if (performance === 'medium') result = enriched.filter(s => s.stats.activityScore >= 40 && s.stats.activityScore < 70);
    if (performance === 'low') result = enriched.filter(s => s.stats.activityScore < 40);
    if (performance === 'atrisk') result = enriched.filter(s => s.stats.overdue > 2 || s.stats.completionRate < 30);

    res.status(200).json({
      success: true,
      count: result.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      students: result,
    });
  } catch (err) { next(err); }
};

// @route GET /api/faculty/students/:id
// Get one student's full profile + all tasks
exports.getStudentDetail = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' })
      .select('-password -passwordResetToken -emailVerificationToken');

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Faculty can only see their assigned students
    if (req.user.role === 'faculty' && student.assignedFaculty?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. This student is not assigned to you.' });
    }

    const [tasks, sessions, achievements] = await Promise.all([
      Task.find({ user: student._id }).sort({ dueDate: 1 }).lean(),
      StudySession.find({ user: student._id }).sort({ date: -1 }).lean(),
      Achievement.find({ user: student._id }).lean(),
    ]);

    // Build weekly chart data (last 7 days)
    const now = new Date();
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayStart = new Date(day.setHours(0, 0, 0, 0));
      const dayEnd = new Date(day.setHours(23, 59, 59, 999));
      weeklyData.push({
        day: new Date(dayStart).toLocaleDateString('en-US', { weekday: 'short' }),
        completed: tasks.filter(t => t.completedAt >= dayStart && t.completedAt <= dayEnd).length,
        created: tasks.filter(t => new Date(t.createdAt) >= dayStart && new Date(t.createdAt) <= dayEnd).length,
      });
    }

    // Subject breakdown
    const subjectMap = {};
    tasks.forEach(t => {
      if (!subjectMap[t.subject]) subjectMap[t.subject] = { subject: t.subject, total: 0, completed: 0 };
      subjectMap[t.subject].total++;
      if (t.status === 'completed') subjectMap[t.subject].completed++;
    });

    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    const studyHours = sessions.filter(s => s.completed).reduce((a, s) => a + (s.duration || 0), 0) / 60;

    res.status(200).json({
      success: true,
      student: student.toPublicJSON(),
      analytics: {
        tasks: { total: tasks.length, completed, overdue, pending: tasks.length - completed - overdue, completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0 },
        studyHours: parseFloat(studyHours.toFixed(1)),
        achievements: achievements.length,
        weeklyData,
        subjectData: Object.values(subjectMap),
        recentTasks: tasks.slice(0, 10),
        recentSessions: sessions.slice(0, 5),
      },
    });
  } catch (err) { next(err); }
};

// @route GET /api/faculty/analytics
// Faculty-level analytics across all students
exports.getFacultyAnalytics = async (req, res, next) => {
  try {
    let studentQuery = { role: 'student', isActive: true };
    if (req.user.role === 'faculty') studentQuery.assignedFaculty = req.user._id;

    const students = await User.find(studentQuery).select('_id name').lean();
    const studentIds = students.map(s => s._id);

    const [allTasks, allSessions] = await Promise.all([
      Task.find({ user: { $in: studentIds } }).lean(),
      StudySession.find({ user: { $in: studentIds }, completed: true }).lean(),
    ]);

    const completed = allTasks.filter(t => t.status === 'completed').length;
    const overdue = allTasks.filter(t => t.status === 'overdue').length;
    const totalStudyHours = allSessions.reduce((a, s) => a + (s.duration || 0), 0) / 60;

    // Top performers
    const studentStats = await Promise.all(students.map(async (s) => {
      const sTasks = allTasks.filter(t => t.user.toString() === s._id.toString());
      const sCompleted = sTasks.filter(t => t.status === 'completed').length;
      return { name: s.name, id: s._id, completed: sCompleted, total: sTasks.length, rate: sTasks.length > 0 ? Math.round((sCompleted / sTasks.length) * 100) : 0 };
    }));
    const topPerformers = studentStats.sort((a, b) => b.rate - a.rate).slice(0, 5);
    const atRisk = studentStats.filter(s => s.rate < 30 || (s.total > 0 && s.total - s.completed > 3)).slice(0, 5);

    // Subject distribution
    const subjectMap = {};
    allTasks.forEach(t => {
      if (!subjectMap[t.subject]) subjectMap[t.subject] = 0;
      subjectMap[t.subject]++;
    });
    const topSubjects = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([subject, count]) => ({ subject, count }));

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents: students.length,
          totalTasks: allTasks.length,
          completedTasks: completed,
          overdueTasks: overdue,
          avgCompletionRate: allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0,
          totalStudyHours: parseFloat(totalStudyHours.toFixed(1)),
        },
        topPerformers,
        atRisk,
        topSubjects,
      },
    });
  } catch (err) { next(err); }
};

// @route POST /api/faculty/assign-student
exports.assignStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    student.assignedFaculty = req.user._id;
    await student.save({ validateBeforeSave: false });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { assignedStudents: studentId } });

    await Notification.create({
      user: studentId,
      title: 'Faculty Assigned 👨‍🏫',
      message: `${req.user.name} has been assigned as your faculty mentor.`,
      type: 'faculty',
      icon: '👨‍🏫',
    });

    res.status(200).json({ success: true, message: 'Student assigned successfully' });
  } catch (err) { next(err); }
};

// @route POST /api/faculty/message-student
exports.messageStudent = async (req, res, next) => {
  try {
    const { studentId, message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    await Notification.create({
      user: studentId,
      title: `Message from ${req.user.name} 💬`,
      message: message.trim(),
      type: 'faculty',
      icon: '💬',
    });

    res.status(200).json({ success: true, message: 'Message sent to student' });
  } catch (err) { next(err); }
};

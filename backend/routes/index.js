const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/main');
const facultyCtrl = require('../controllers/faculty');
const adminCtrl = require('../controllers/admin');
const { validateStudySession, validateTask, validateCreateFaculty, validateUpdateUser } = require('../middleware/validate');

// ─── Study Sessions ──────────────────────────────────────────────────────────
const studyRouter = express.Router();
studyRouter.use(protect);
studyRouter.get('/weekly-goals', ctrl.getWeeklyGoals);
studyRouter.get('/', ctrl.getSessions);
studyRouter.post('/', validateStudySession, ctrl.createSession);
studyRouter.put('/:id', ctrl.updateSession);
studyRouter.delete('/:id', ctrl.deleteSession);

// ─── Analytics ───────────────────────────────────────────────────────────────
const analyticsRouter = express.Router();
analyticsRouter.use(protect);
analyticsRouter.get('/', ctrl.getAnalytics);

// ─── Notifications ────────────────────────────────────────────────────────────
const notifRouter = express.Router();
notifRouter.use(protect);
notifRouter.get('/', ctrl.getNotifications);
notifRouter.put('/mark-read', ctrl.markAllRead);
notifRouter.delete('/:id', ctrl.deleteNotification);

// ─── Profile ─────────────────────────────────────────────────────────────────
const profileRouter = express.Router();
profileRouter.use(protect);
profileRouter.put('/', ctrl.updateProfile);

// ─── Achievements ─────────────────────────────────────────────────────────────
const achieveRouter = express.Router();
achieveRouter.use(protect);
achieveRouter.get('/', ctrl.getAchievements);

// ─── Faculty ─────────────────────────────────────────────────────────────────
const facultyRouter = express.Router();
facultyRouter.use(protect, authorize('faculty', 'admin'));
facultyRouter.get('/students', facultyCtrl.getStudents);
facultyRouter.get('/students/:id', facultyCtrl.getStudentDetail);
facultyRouter.get('/analytics', facultyCtrl.getFacultyAnalytics);
facultyRouter.post('/assign-student', facultyCtrl.assignStudent);
facultyRouter.post('/message-student', facultyCtrl.messageStudent);

// ─── Admin ────────────────────────────────────────────────────────────────────
const adminRouter = express.Router();
adminRouter.use(protect, authorize('admin'));
adminRouter.get('/dashboard', adminCtrl.getDashboard);
adminRouter.get('/users', adminCtrl.getUsers);
adminRouter.get('/users/:id', adminCtrl.getUser);
adminRouter.put('/users/:id', validateUpdateUser, adminCtrl.updateUser);
adminRouter.delete('/users/:id', adminCtrl.deleteUser);
adminRouter.post('/faculty', validateCreateFaculty, adminCtrl.createFaculty);
adminRouter.get('/audit-logs', adminCtrl.getAuditLogs);
adminRouter.get('/system-stats', adminCtrl.getSystemStats);
adminRouter.post('/broadcast', adminCtrl.broadcastNotification);

module.exports = { studyRouter, analyticsRouter, notifRouter, profileRouter, achieveRouter, facultyRouter, adminRouter };

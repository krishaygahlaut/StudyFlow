const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Task = require('../models/Task');
const { Note, StudySession, Notification, Achievement } = require('../models/index');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/studyflow_pro');
  console.log('✅ Connected to MongoDB');

  await Promise.all([User.deleteMany(), Task.deleteMany(), Note.deleteMany(), StudySession.deleteMany(), Notification.deleteMany(), Achievement.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  // ─── Admin ──────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'System Admin',
    email: process.env.ADMIN_EMAIL || 'admin@studyflow.app',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
    xp: 9999,
    level: 99,
  });

  // ─── Faculty ────────────────────────────────────────────────────────────
  const faculty1 = await User.create({
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@studyflow.app',
    password: 'Faculty@123456',
    role: 'faculty',
    department: 'Computer Science',
    designation: 'Associate Professor',
    isEmailVerified: true,
    isActive: true,
  });

  const faculty2 = await User.create({
    name: 'Prof. James Wilson',
    email: 'james.wilson@studyflow.app',
    password: 'Faculty@123456',
    role: 'faculty',
    department: 'Mathematics',
    designation: 'Professor',
    isEmailVerified: true,
    isActive: true,
  });

  // ─── Students ───────────────────────────────────────────────────────────
  const studentData = [
    { name: 'Alex Johnson', email: 'alex@studyflow.app', institution: 'MIT', major: 'Computer Science', year: '3rd Year', studentId: 'MIT2024001', xp: 420, level: 5, streak: 7, totalTasksCompleted: 12, faculty: faculty1._id },
    { name: 'Priya Sharma', email: 'priya@studyflow.app', institution: 'Stanford', major: 'Data Science', year: '2nd Year', studentId: 'STN2024002', xp: 680, level: 7, streak: 14, totalTasksCompleted: 24, faculty: faculty1._id },
    { name: 'Marcus Lee', email: 'marcus@studyflow.app', institution: 'MIT', major: 'Electrical Engineering', year: '4th Year', studentId: 'MIT2024003', xp: 210, level: 3, streak: 2, totalTasksCompleted: 5, faculty: faculty1._id },
    { name: 'Emma Davis', email: 'emma@studyflow.app', institution: 'Harvard', major: 'Applied Mathematics', year: '1st Year', studentId: 'HVD2024004', xp: 150, level: 2, streak: 3, totalTasksCompleted: 3, faculty: faculty2._id },
    { name: 'Ravi Kumar', email: 'ravi@studyflow.app', institution: 'IIT Delhi', major: 'Computer Science', year: '3rd Year', studentId: 'IIT2024005', xp: 550, level: 6, streak: 10, totalTasksCompleted: 18, faculty: faculty2._id },
  ];

  const students = await Promise.all(studentData.map(s => User.create({
    name: s.name, email: s.email, password: 'Student@123456',
    role: 'student', institution: s.institution, major: s.major,
    year: s.year, studentId: s.studentId, xp: s.xp, level: s.level,
    streak: s.streak, totalTasksCompleted: s.totalTasksCompleted,
    assignedFaculty: s.faculty, isEmailVerified: true, isActive: true,
    lastActiveDate: new Date(),
  })));

  // Update faculty assigned students
  await User.findByIdAndUpdate(faculty1._id, { assignedStudents: [students[0]._id, students[1]._id, students[2]._id] });
  await User.findByIdAndUpdate(faculty2._id, { assignedStudents: [students[3]._id, students[4]._id] });

  // ─── Tasks for Alex (students[0]) ──────────────────────────────────────
  const now = new Date();
  const tasks = await Task.create([
    { user: students[0]._id, title: 'Complete Machine Learning Assignment', subject: 'CS 489', priority: 'high', status: 'todo', category: 'assignment', dueDate: new Date(now.getTime() + 2 * 86400000), estimatedTime: 180, tags: ['ML', 'Python'], description: 'Implement CNN for image classification using PyTorch' },
    { user: students[0]._id, title: 'Read Chapter 7 - Operating Systems', subject: 'CS 340', priority: 'medium', status: 'in-progress', category: 'reading', dueDate: new Date(now.getTime() + 1 * 86400000), estimatedTime: 90, tags: ['OS'] },
    { user: students[0]._id, title: 'Database Design Project', subject: 'CS 360', priority: 'urgent', status: 'todo', category: 'project', dueDate: new Date(now.getTime() + 5 * 86400000), estimatedTime: 360, tags: ['SQL', 'MongoDB'] },
    { user: students[0]._id, title: 'Calculus Problem Set #4', subject: 'MATH 251', priority: 'medium', status: 'completed', category: 'assignment', dueDate: new Date(now.getTime() - 1 * 86400000), completedAt: new Date(now.getTime() - 2 * 86400000), estimatedTime: 120 },
    { user: students[0]._id, title: 'Physics Lab Report', subject: 'PHYS 201', priority: 'high', status: 'completed', category: 'lab', dueDate: new Date(now.getTime() - 2 * 86400000), completedAt: new Date(now.getTime() - 3 * 86400000), estimatedTime: 150 },
    { user: students[0]._id, title: 'History Essay: Cold War', subject: 'HIST 310', priority: 'low', status: 'overdue', category: 'assignment', dueDate: new Date(now.getTime() - 3 * 86400000), estimatedTime: 240 },
    { user: students[0]._id, title: 'Algorithms Midterm Prep', subject: 'CS 401', priority: 'urgent', status: 'todo', category: 'exam', dueDate: new Date(now.getTime() + 4 * 86400000), estimatedTime: 300, tags: ['algorithms', 'exam'] },
    // Priya's tasks
    { user: students[1]._id, title: 'Data Visualization Project', subject: 'DS 301', priority: 'high', status: 'in-progress', category: 'project', dueDate: new Date(now.getTime() + 3 * 86400000), estimatedTime: 240 },
    { user: students[1]._id, title: 'Statistical Analysis Report', subject: 'STAT 401', priority: 'medium', status: 'completed', category: 'assignment', dueDate: new Date(now.getTime() - 1 * 86400000), completedAt: new Date(now.getTime() - 1 * 86400000), estimatedTime: 180 },
    { user: students[1]._id, title: 'Machine Learning Final Project', subject: 'CS 489', priority: 'urgent', status: 'todo', category: 'project', dueDate: new Date(now.getTime() + 7 * 86400000), estimatedTime: 480 },
    // Marcus tasks
    { user: students[2]._id, title: 'Circuit Design Assignment', subject: 'EE 301', priority: 'high', status: 'overdue', category: 'assignment', dueDate: new Date(now.getTime() - 2 * 86400000), estimatedTime: 200 },
    { user: students[2]._id, title: 'Signal Processing Lab', subject: 'EE 401', priority: 'medium', status: 'todo', category: 'lab', dueDate: new Date(now.getTime() + 5 * 86400000), estimatedTime: 150 },
  ]);

  // ─── Notes ──────────────────────────────────────────────────────────────
  await Note.create([
    { user: students[0]._id, title: 'ML Key Concepts', subject: 'CS 489', content: '## CNN Architecture\n\n- Convolutional layers extract spatial features\n- Pooling reduces dimensionality\n- Fully connected layers for classification\n\n**Backpropagation** uses chain rule to update weights', color: '#6366f1', pinned: true },
    { user: students[0]._id, title: 'OS Memory Management', subject: 'CS 340', content: '## Virtual Memory\n\n- Page tables map virtual → physical\n- TLB caches recent translations\n- Page faults trigger disk access\n\n**Replacement:** LRU > FIFO > Random', color: '#10b981', pinned: true },
    { user: students[1]._id, title: 'Python Data Analysis Cheatsheet', subject: 'DS 301', content: '## Pandas\n\n```python\ndf.describe()\ndf.groupby("col").agg({"val": "mean"})\ndf.pivot_table()\n```', color: '#f59e0b', pinned: true },
  ]);

  // ─── Study Sessions ──────────────────────────────────────────────────────
  const subjects = ['CS 489', 'CS 340', 'CS 360', 'MATH 251', 'PHYS 201'];
  const sessionData = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const duration = 60 + Math.floor(Math.random() * 120);
    const sh = 9 + Math.floor(i / 2);
    sessionData.push({
      user: students[i % 2]._id,
      subject: subjects[i % subjects.length],
      date: d,
      startTime: `${String(sh).padStart(2,'0')}:00`,
      endTime: `${String(sh + Math.floor(duration/60)).padStart(2,'0')}:${String(duration%60).padStart(2,'0')}`,
      duration, completed: true,
      mood: ['great','good','okay'][i % 3],
      rating: 3 + (i % 3),
      weeklyGoalHours: 3,
    });
  }
  await StudySession.create(sessionData);

  // ─── Achievements ────────────────────────────────────────────────────────
  await Achievement.create([
    { user: students[0]._id, type: 'tasks_1', title: 'First Step', description: 'Completed first task!', icon: '🌟', xpReward: 50, rarity: 'common' },
    { user: students[0]._id, type: 'tasks_5', title: 'Getting Started', description: 'Completed 5 tasks!', icon: '⭐', xpReward: 100, rarity: 'common' },
    { user: students[0]._id, type: 'tasks_10', title: 'Task Warrior', description: 'Completed 10 tasks!', icon: '⚔️', xpReward: 150, rarity: 'rare' },
    { user: students[1]._id, type: 'tasks_1', title: 'First Step', icon: '🌟', xpReward: 50, rarity: 'common' },
    { user: students[1]._id, type: 'tasks_25', title: 'Productivity Master', icon: '🏆', xpReward: 300, rarity: 'epic' },
  ]);

  // ─── Notifications ───────────────────────────────────────────────────────
  await Notification.create([
    { user: students[0]._id, title: '🔥 7-Day Streak!', message: "Unstoppable! 7 days in a row.", type: 'streak', icon: '🔥' },
    { user: students[0]._id, title: '⚠️ Due Tomorrow', message: '"Read Chapter 7 - OS" is due in less than 24 hours!', type: 'deadline', icon: '⏰' },
    { user: students[1]._id, title: '🏆 Achievement Unlocked', message: 'Productivity Master — 25 tasks completed!', type: 'achievement', icon: '🏆' },
  ]);

  console.log('\n✅ Sample data seeded successfully!\n');
  console.log('─'.repeat(50));
  console.log('🔑 LOGIN CREDENTIALS:');
  console.log('─'.repeat(50));
  console.log(`👑 Admin:   admin@studyflow.app     / Admin@123456`);
  console.log(`👨‍🏫 Faculty: sarah.chen@studyflow.app / Faculty@123456`);
  console.log(`👨‍🏫 Faculty: james.wilson@studyflow.app / Faculty@123456`);
  console.log(`🎓 Student: alex@studyflow.app       / Student@123456`);
  console.log(`🎓 Student: priya@studyflow.app      / Student@123456`);
  console.log(`🎓 Student: ravi@studyflow.app       / Student@123456`);
  console.log('─'.repeat(50));

  process.exit(0);
};

seed().catch(err => { console.error('Seeder failed:', err); process.exit(1); });

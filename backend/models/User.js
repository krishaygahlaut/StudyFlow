const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student',
  },
  avatar: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Student specific
  studentId: { type: String, default: '' },
  institution: { type: String, default: '' },
  major: { type: String, default: '' },
  year: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 300 },
  enrolledCourses: [{ type: mongoose.Schema.ObjectId, ref: 'Course' }],
  assignedFaculty: { type: mongoose.Schema.ObjectId, ref: 'User' },

  // Faculty specific
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  assignedStudents: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],

  // Gamification
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  totalTasksCompleted: { type: Number, default: 0 },
  studyHours: { type: Number, default: 0 },

  // Auth tokens
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  refreshToken: String,

  // Metadata
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  preferences: {
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true },
    weekStartDay: { type: Number, default: 1 },
    emailNotifications: { type: Boolean, default: true },
  },
}, { timestamps: true });

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ assignedFaculty: 1 });
UserSchema.index({ institution: 1 });

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign access JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Sign refresh token
UserSchema.methods.getRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
UserSchema.methods.getEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Generate password reset token
UserSchema.methods.getPasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

// Calculate level from XP
UserSchema.methods.calculateLevel = function() {
  this.level = Math.floor(this.xp / 100) + 1;
};

// Virtual: full profile (exclude sensitive)
UserSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    isEmailVerified: this.isEmailVerified,
    studentId: this.studentId,
    institution: this.institution,
    major: this.major,
    year: this.year,
    bio: this.bio,
    department: this.department,
    designation: this.designation,
    xp: this.xp,
    level: this.level,
    streak: this.streak,
    totalTasksCompleted: this.totalTasksCompleted,
    studyHours: this.studyHours,
    preferences: this.preferences,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);

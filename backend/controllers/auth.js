const crypto = require('crypto');
const User = require('../models/User');
const { Notification } = require('../models/index');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();
  res.status(statusCode).json({
    success: true,
    message,
    token,
    refreshToken,
    user: user.toPublicJSON(),
  });
};

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, institution, major, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Only allow student/faculty self-registration
    const allowedRoles = ['student', 'faculty'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    const user = await User.create({ name, email, password, role: userRole, institution, major, department });

    // Send verification email (non-blocking)
    try {
      const verifyToken = user.getEmailVerificationToken();
      await user.save({ validateBeforeSave: false });
      await sendVerificationEmail(user, verifyToken);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    // Welcome notification
    await Notification.create({
      user: user._id,
      title: `Welcome to StudyFlow, ${name}! 🚀`,
      message: 'Your account is ready. Verify your email to unlock all features.',
      type: 'system',
      icon: '🎉',
    });

    sendTokenResponse(user, 201, res, 'Account created successfully! Please check your email to verify.');
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update streak
    const today = new Date().toDateString();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastActive === yesterday) {
      user.streak += 1;
      if ([7, 14, 30, 60, 100].includes(user.streak)) {
        await Notification.create({
          user: user._id,
          title: `🔥 ${user.streak}-Day Streak!`,
          message: `Incredible! You've logged in for ${user.streak} days straight!`,
          type: 'streak',
          icon: '🔥',
        });
      }
    } else if (lastActive !== today) {
      user.streak = 1;
    }
    user.lastActiveDate = new Date();
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user: user.toPublicJSON() });
  } catch (err) { next(err); }
};

// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @route GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (err) { next(err); }
};

// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account exists, a reset email has been sent.' });
    }
    const token = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(user, token);
    res.status(200).json({ success: true, message: 'If an account exists, a reset email has been sent.' });
  } catch (err) { next(err); }
};

// @route PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (err) { next(err); }
};

// @route POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    const newToken = user.getSignedJwtToken();
    res.status(200).json({ success: true, token: newToken });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// @route PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
};

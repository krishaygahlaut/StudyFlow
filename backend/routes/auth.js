// routes/auth.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('../middleware/validate');

r.post('/register', validateRegister, c.register);
r.post('/login', validateLogin, c.login);
r.post('/logout', protect, c.logout);
r.get('/me', protect, c.getMe);
r.get('/verify-email/:token', c.verifyEmail);
r.post('/forgot-password', validateForgotPassword, c.forgotPassword);
r.put('/reset-password/:token', validateResetPassword, c.resetPassword);
r.post('/refresh-token', c.refreshToken);
r.put('/change-password', protect, c.changePassword);

module.exports = r;

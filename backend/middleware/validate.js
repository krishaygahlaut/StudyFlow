const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }
  next();
};

// Auth validators
const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  body('role').optional().isIn(['student', 'faculty']).withMessage('Invalid role'),
  handleValidation,
];

const validateLogin = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const validateForgotPassword = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  handleValidation,
];

const validateResetPassword = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase letter')
    .matches(/[a-z]/).withMessage('Must contain lowercase letter')
    .matches(/[0-9]/).withMessage('Must contain a number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Must contain a special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  handleValidation,
];

// Task validators
const validateTask = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 150 }).withMessage('Title too long'),
  body('dueDate').notEmpty().withMessage('Due date is required').isISO8601().withMessage('Invalid date format'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('category').optional().isIn(['assignment', 'exam', 'project', 'reading', 'lab', 'presentation', 'other']).withMessage('Invalid category'),
  body('estimatedTime').optional().isNumeric({ min: 0 }).withMessage('Estimated time must be a positive number'),
  handleValidation,
];

// Note validators
const validateNote = [
  body('title').trim().notEmpty().withMessage('Note title is required').isLength({ max: 150 }).withMessage('Title too long'),
  handleValidation,
];

// Study session validators
const validateStudySession = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Invalid date'),
  body('startTime').notEmpty().withMessage('Start time is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  handleValidation,
];

// Faculty validators
const validateCreateFaculty = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('department').optional().trim().isLength({ max: 100 }),
  body('designation').optional().trim().isLength({ max: 100 }),
  handleValidation,
];

// Admin validators
const validateUpdateUser = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').optional().trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateTask,
  validateNote,
  validateStudySession,
  validateCreateFaculty,
  validateUpdateUser,
};

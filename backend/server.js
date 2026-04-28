const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { studyRouter, analyticsRouter, notifRouter, profileRouter, achieveRouter, facultyRouter, adminRouter } = require('./routes/index');

connectDB();

const app = express();

// ─── Security ──────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(mongoSanitize());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',');
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: { success: false, message: 'Too many requests, try again later.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many auth attempts, try again in 15 minutes.' } });

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// ─── Parsing & Compression ─────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Static Files ──────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/study-sessions', studyRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notifRouter);
app.use('/api/profile', profileRouter);
app.use('/api/achievements', achieveRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/admin', adminRouter);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: 'healthy',
  version: '2.0.0',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  environment: process.env.NODE_ENV,
}));

// ─── Error Handling ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 StudyFlow Pro v2.0 running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API: http://localhost:${PORT}/api\n`);
});

process.on('unhandledRejection', (err) => { console.error('Unhandled Rejection:', err.message); server.close(() => process.exit(1)); });
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err.message); process.exit(1); });

module.exports = app;

const { AuditLog } = require('../models/index');

// Global error handler
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') { statusCode = 400; message = 'Invalid resource ID'; }
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired'; }

  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Audit logger
const auditLog = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (req.user && body.success !== false) {
      try {
        await AuditLog.create({
          actor: req.user._id,
          actorRole: req.user.role,
          action,
          resource,
          resourceId: req.params?.id,
          details: { method: req.method, path: req.path, query: req.query },
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          success: body.success !== false,
        });
      } catch (e) { /* silent */ }
    }
    return originalJson(body);
  };
  next();
};

// Not found handler
const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, auditLog, notFound };

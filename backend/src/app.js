const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const env = require('./config/env');
const setupSwagger = require('./config/swagger');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');
const { HTTP_STATUS, ERROR_CODES } = require('./utils/constants');
const { sendError } = require('./utils/response');

const app = express();

// Security HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration — Dynamic and Production Safe
const rawOrigins = env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map((url) => url.trim().replace(/\/$/, ''));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or non-browser tools (e.g. Postman, Mobile apps)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');
    const isAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      allowedOrigins.includes('*') ||
      normalizedOrigin.endsWith('.onrender.com') ||
      normalizedOrigin.includes('localhost') ||
      normalizedOrigin.includes('127.0.0.1');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked access for origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Swagger / OpenAPI Documentation Route
setupSwagger(app);

// Mount API v1 Routes
app.use('/api/v1', apiRoutes);

// 404 Route Not Found Handler
app.use((req, res) => {
  return sendError(
    res,
    `Route ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.NOT_FOUND
  );
});

// Centralized Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;

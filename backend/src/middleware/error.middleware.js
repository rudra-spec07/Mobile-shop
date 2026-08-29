const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');
const { sendError } = require('../utils/response');
const env = require('../config/env');

/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;

  // Log error internally
  if (env.NODE_ENV === 'development') {
    console.error('💥 [Error Handler]:', err);
  } else {
    console.error(`💥 [Error Handler]: ${err.name || 'Error'}: ${err.message}`);
  }

  // Handle Prisma / Database Known Request Errors
  if (err.code && err.code.startsWith('P')) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = ERROR_CODES.DATABASE_ERROR;
    if (err.code === 'P2002') {
      statusCode = HTTP_STATUS.CONFLICT;
      errorCode = ERROR_CODES.DUPLICATE_DATA;
      message = 'A record with this unique field already exists';
    } else if (err.code === 'P2025') {
      statusCode = HTTP_STATUS.NOT_FOUND;
      errorCode = ERROR_CODES.NOT_FOUND;
      message = 'Requested database record was not found';
    } else if (env.NODE_ENV === 'production') {
      message = 'Database operation failed';
    }
  }

  // Handle JWT specific errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    errorCode = ERROR_CODES.AUTHENTICATION_ERROR;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    errorCode = ERROR_CODES.AUTHENTICATION_ERROR;
    message = 'Authentication token has expired';
  }

  // Return standard formatted error response
  return sendError(res, message, statusCode, errorCode);
};

module.exports = {
  AppError,
  errorHandler,
};

const { verifyToken } = require('../utils/jwt');
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');
const { sendError } = require('../utils/response');

/**
 * Required JWT Authentication Middleware
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(
      res,
      'Authentication token is missing or malformed',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Authentication token has expired', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTHENTICATION_ERROR);
    }
    return sendError(res, 'Invalid authentication token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTHENTICATION_ERROR);
  }
};

/**
 * Optional JWT Authentication Middleware
 * Decodes JWT if present, but does not block unauthenticated public requests.
 */
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch (err) {
    // Ignore token errors for optional authentication
  }
  return next();
};

module.exports = {
  authenticateToken,
  optionalAuthenticate,
};

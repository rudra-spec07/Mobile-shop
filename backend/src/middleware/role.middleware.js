const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');
const { sendError } = require('../utils/response');

/**
 * Role-based Authorization Middleware
 * @param  {...string} allowedRoles - List of authorized roles (e.g. SUPER_ADMIN, CUSTOMER)
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(
        res,
        'User authorization details missing',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        'Access denied. You do not have permission to access this resource',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.AUTHORIZATION_ERROR
      );
    }

    return next();
  };
};

module.exports = {
  authorizeRoles,
};

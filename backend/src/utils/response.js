const { HTTP_STATUS, ERROR_CODES } = require('./constants');

/**
 * Send a standardized success response.
 */
const sendSuccess = (res, message = 'Success', data = {}, statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a standardized paginated list response.
 */
const sendPaginated = (res, message = 'Data fetched successfully', data = [], pagination = {}, statusCode = HTTP_STATUS.OK) => {
  const { page = 1, limit = 10, total = 0 } = pagination;
  const totalPages = Math.ceil(total / limit) || 1;

  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      totalPages: Number(totalPages),
    },
  });
};

/**
 * Send a standardized error response.
 */
const sendError = (
  res,
  message = 'An error occurred',
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
  });
};

module.exports = {
  sendSuccess,
  sendPaginated,
  sendError,
};

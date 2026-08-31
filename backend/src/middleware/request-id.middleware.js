const { randomUUID } = require('crypto');

/**
 * Request ID Middleware
 * Attaches X-Request-ID to incoming requests and sets it on the response header.
 */
const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

module.exports = {
  requestIdMiddleware,
};

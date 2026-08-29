const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a JWT token for a given user payload.
 */
const generateToken = (payload, expiresIn = env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

/**
 * Verify and decode a JWT token.
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};

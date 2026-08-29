const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt.
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain text password with a hashed password.
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};

const { getIO } = require('../config/socket');

/**
 * Failure-Isolated Helper: Emit Realtime Event to Specific User
 * @param {string} userId - Recipient User ID
 * @param {string} event - Realtime Event Name
 * @param {object} payload - Event Payload Data
 */
const emitToUser = (userId, event, payload = {}) => {
  try {
    const io = getIO();
    if (!io || !userId || !event) return false;
    io.to(`user:${userId}`).emit(event, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('⚠️ [SOCKET EMIT ERROR - USER]:', err.message);
    return false;
  }
};

/**
 * Failure-Isolated Helper: Emit Realtime Event to Admin Room ('admin')
 * @param {string} event - Realtime Event Name
 * @param {object} payload - Event Payload Data
 */
const emitToAdmin = (event, payload = {}) => {
  try {
    const io = getIO();
    if (!io || !event) return false;
    io.to('admin').emit(event, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('⚠️ [SOCKET EMIT ERROR - ADMIN]:', err.message);
    return false;
  }
};

/**
 * Failure-Isolated Helper: Broadcast Realtime Event to All Connected Sockets
 * @param {string} event - Realtime Event Name
 * @param {object} payload - Event Payload Data
 */
const broadcastEvent = (event, payload = {}) => {
  try {
    const io = getIO();
    if (!io || !event) return false;
    io.emit(event, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('⚠️ [SOCKET EMIT ERROR - BROADCAST]:', err.message);
    return false;
  }
};

module.exports = {
  emitToUser,
  emitToAdmin,
  broadcastEvent,
};

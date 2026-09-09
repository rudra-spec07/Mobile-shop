const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const env = require('./env');

let io = null;

/**
 * Initialize Socket.IO server attached to HTTP Server instance
 */
const initSocket = (server) => {
  const rawOrigins = env.CLIENT_URL || 'http://localhost:5173';
  const allowedOrigins = rawOrigins.split(',').map((url) => url.trim().replace(/\/$/, ''));

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
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
          callback(new Error(`CORS policy blocked WebSocket connection for origin: ${origin}`));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // JWT Authentication & Authorization Middleware for Sockets
  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!authHeader) {
        return next(new Error('Authentication token is missing'));
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      if (!token) {
        return next(new Error('Authentication token is malformed'));
      }

      const decoded = verifyToken(token);
      const userId = decoded.userId || decoded.id;
      const role = decoded.role;

      if (!userId) {
        return next(new Error('Invalid token payload'));
      }

      socket.user = { userId, role };
      next();
    } catch (err) {
      return next(new Error('Authentication failed: ' + (err.message || 'Invalid token')));
    }
  });

  // Connection Handler & Room Assignment
  io.on('connection', (socket) => {
    const { userId, role } = socket.user || {};

    if (userId) {
      const userRoom = `user:${userId}`;
      socket.join(userRoom);
    }

    if (role === 'SUPER_ADMIN') {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      // Automatic cleanup handled by socket.io
    });
  });

  return io;
};

/**
 * Get active Socket.IO server instance
 */
const getIO = () => {
  if (!io) {
    console.warn('⚠️ [SOCKET.IO WARNING]: Socket.IO server is not initialized yet.');
    return null;
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};

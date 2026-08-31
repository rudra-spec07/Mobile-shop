const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');
const { prisma } = require('../config/database');

/**
 * Basic System Health check controller
 * Endpoint: GET /api/v1/health
 */
const getHealthStatus = async (req, res) => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Mobile-Adda backend is running',
    status: 'UP',
    service: 'mobile-adda-backend',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Database Connectivity Health check controller
 * Endpoint: GET /api/v1/health/database
 */
const getDatabaseHealth = async (req, res) => {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTimeMs = Date.now() - startTime;

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Database connection is healthy',
      status: 'UP',
      database: 'Neon PostgreSQL',
      responseTimeMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Database connectivity failure',
      status: 'DOWN',
      errorCode: ERROR_CODES.DATABASE_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  getHealthStatus,
  getDatabaseHealth,
};

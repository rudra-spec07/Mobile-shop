const { HTTP_STATUS } = require('../utils/constants');

/**
 * Health check controller
 * Endpoint: GET /api/v1/health
 */
const getHealthStatus = async (req, res) => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Mobile-Adda backend is running',
    status: 'UP',
  });
};

module.exports = {
  getHealthStatus,
};

const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');
const { prisma } = require('../config/database');

/**
 * Customer Registration Controller
 * Endpoint: POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.registerCustomer(req.body);
    return sendSuccess(res, 'Customer account created successfully', result, HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

/**
 * User Login Controller (Customer / Super Admin)
 * Endpoint: POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, 'Login successful', result, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Get Authenticated Profile Controller
 * Endpoint: GET /api/v1/auth/me
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return sendSuccess(res, 'Profile fetched successfully', { user }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};

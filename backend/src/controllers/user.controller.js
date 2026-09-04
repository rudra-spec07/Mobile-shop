const userService = require('../services/user.service');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Logout Controller
 * Endpoint: POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Logout successful', {}, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Forgot Password Controller
 * Endpoint: POST /api/v1/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const identifier = req.body.identifier || req.body.email;
    const result = await userService.forgotPassword(identifier);
    return sendSuccess(res, result.message, {}, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Reset Password Controller
 * Endpoint: POST /api/v1/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const result = await userService.resetPassword(req.body);
    return sendSuccess(res, result.message, {}, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Change Password Controller
 * Endpoint: PATCH /api/v1/users/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(req.user.userId, req.body);
    return sendSuccess(res, result.message, {}, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Get Profile Controller
 * Endpoint: GET /api/v1/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.userId);
    return sendSuccess(res, 'Profile fetched successfully', { user }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Update Profile Controller
 * Endpoint: PATCH /api/v1/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.user.userId, req.body);
    return sendSuccess(res, 'Profile updated successfully', { user }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin: List Users Controller
 * Endpoint: GET /api/v1/admin/users
 */
const getAdminUsers = async (req, res, next) => {
  try {
    const { users, pagination } = await userService.getAdminUsers(req.query);
    return sendPaginated(res, 'Users fetched successfully', users, pagination, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin: Get User Details Controller
 * Endpoint: GET /api/v1/admin/users/:id
 */
const getAdminUserById = async (req, res, next) => {
  try {
    const user = await userService.getAdminUserById(req.params.id);
    return sendSuccess(res, 'User details fetched successfully', { user }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin: Update User Controller
 * Endpoint: PATCH /api/v1/admin/users/:id
 */
const adminUpdateUser = async (req, res, next) => {
  try {
    const user = await userService.adminUpdateUser(req.params.id, req.body);
    return sendSuccess(res, 'User updated successfully', { user }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin: Update User Status Controller
 * Endpoint: PATCH /api/v1/admin/users/:id/status
 */
const adminUpdateUserStatus = async (req, res, next) => {
  try {
    const user = await userService.adminUpdateUserStatus(req.params.id, req.body);
    return sendSuccess(res, `User status updated to ${user.isActive ? 'ACTIVE' : 'INACTIVE'}`, { user }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  getAdminUsers,
  getAdminUserById,
  adminUpdateUser,
  adminUpdateUserStatus,
};

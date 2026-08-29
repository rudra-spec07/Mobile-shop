const express = require('express');
const userController = require('../controllers/user.controller');
const { validate } = require('../middleware/validation.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');
const {
  changePasswordSchema,
  updateProfileSchema,
  adminUpdateUserSchema,
  adminUpdateStatusSchema,
} = require('../validators/user.validator');

const router = express.Router();

// ==========================================
// CUSTOMER & USER PROFILE ROUTES (Authenticated)
// ==========================================

/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Get Authenticated User Profile
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authenticateToken, userController.getProfile);

/**
 * @openapi
 * /users/profile:
 *   patch:
 *     summary: Update Authenticated User Profile
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 */
router.patch('/profile', authenticateToken, validate(updateProfileSchema), userController.updateProfile);

/**
 * @openapi
 * /users/change-password:
 *   patch:
 *     summary: Change Password
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 */
router.patch('/change-password', authenticateToken, validate(changePasswordSchema), userController.changePassword);

module.exports = router;

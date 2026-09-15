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

/**
 * @openapi
 * /users/export-data:
 *   get:
 *     summary: DPDP Act Data Portability Export
 *     tags:
 *       - DPDP Data Privacy
 *     security:
 *       - bearerAuth: []
 */
router.get('/export-data', authenticateToken, userController.exportUserData);

/**
 * @openapi
 * /users/withdraw-consent:
 *   post:
 *     summary: DPDP Act Optional Consent Withdrawal
 *     tags:
 *       - DPDP Data Privacy
 *     security:
 *       - bearerAuth: []
 */
router.post('/withdraw-consent', authenticateToken, userController.withdrawConsent);

/**
 * @openapi
 * /users/request-erasure:
 *   post:
 *     summary: DPDP Act Data Erasure Request
 *     tags:
 *       - DPDP Data Privacy
 *     security:
 *       - bearerAuth: []
 */
router.post('/request-erasure', authenticateToken, userController.requestDataErasure);

module.exports = router;

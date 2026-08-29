const express = require('express');
const userController = require('../controllers/user.controller');
const { validate } = require('../middleware/validation.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');
const {
  adminUpdateUserSchema,
  adminUpdateStatusSchema,
} = require('../validators/user.validator');

const router = express.Router();

// ==========================================
// SUPER ADMIN USER MANAGEMENT ROUTES (SUPER_ADMIN Only)
// ==========================================

// Enforce Authentication and Super Admin Role Authorization on all admin user routes
router.use(authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN));

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: Super Admin List Users (Paginated & Searchable)
 *     tags:
 *       - Admin User Management
 *     security:
 *       - bearerAuth: []
 */
router.get('/', userController.getAdminUsers);

/**
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     summary: Super Admin Get User Details
 *     tags:
 *       - Admin User Management
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', userController.getAdminUserById);

/**
 * @openapi
 * /admin/users/{id}:
 *   patch:
 *     summary: Super Admin Update User Details
 *     tags:
 *       - Admin User Management
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', validate(adminUpdateUserSchema), userController.adminUpdateUser);

/**
 * @openapi
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Super Admin Activate/Deactivate User Status
 *     tags:
 *       - Admin User Management
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', validate(adminUpdateStatusSchema), userController.adminUpdateUserStatus);

module.exports = router;

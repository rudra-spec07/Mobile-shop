const express = require('express');
const adminDashboardController = require('../controllers/admin-dashboard.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Enforce JWT Authentication and SUPER_ADMIN Role Authorization on all Dashboard routes
router.use(authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN));

/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     summary: Get overall admin dashboard statistics
 *     tags:
 *       - Admin Dashboard
 *     security:
 *       - bearerAuth: []
 */
router.get('/', adminDashboardController.getDashboard);

/**
 * @openapi
 * /admin/dashboard/recent-enquiries:
 *   get:
 *     summary: Get recent customer enquiries
 *     tags:
 *       - Admin Dashboard
 *     security:
 *       - bearerAuth: []
 */
router.get('/recent-enquiries', adminDashboardController.getRecentEnquiries);

/**
 * @openapi
 * /admin/dashboard/recent-requests:
 *   get:
 *     summary: Get recent customer service requests
 *     tags:
 *       - Admin Dashboard
 *     security:
 *       - bearerAuth: []
 */
router.get('/recent-requests', adminDashboardController.getRecentRequests);

/**
 * @openapi
 * /admin/dashboard/attention:
 *   get:
 *     summary: Get attention items requiring admin action
 *     tags:
 *       - Admin Dashboard
 *     security:
 *       - bearerAuth: []
 */
router.get('/attention', adminDashboardController.getAttentionItems);

/**
 * @openapi
 * /admin/dashboard/audit-logs:
 *   get:
 *     summary: Get system audit logs
 *     tags:
 *       - Admin Dashboard
 *     security:
 *       - bearerAuth: []
 */
router.get('/audit-logs', adminDashboardController.getAuditLogs);

module.exports = router;

const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  retryFailedNotification,
} = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  getNotificationsQuerySchema,
  notificationIdParamSchema,
} = require('../validators/notification.validator');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Apply Authentication for all notification endpoints
router.use(authenticateToken);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Get Authenticated User Notifications (Paginated)
 *     tags: [Notifications]
 */
router.get('/', validate(getNotificationsQuerySchema, 'query'), getNotifications);

/**
 * @openapi
 * /notifications/unread-count:
 *   get:
 *     summary: Get Unread Notification Count
 *     tags: [Notifications]
 */
router.get('/unread-count', getUnreadCount);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark Notification as Read (Owner Only)
 *     tags: [Notifications]
 */
router.patch('/:id/read', validate(notificationIdParamSchema, 'params'), markAsRead);

/**
 * @openapi
 * /admin/notifications/{id}/retry:
 *   post:
 *     summary: Retry Failed Email Notification (Super Admin Only)
 *     tags: [Notifications]
 */
router.post('/admin/notifications/:id/retry', authorizeRoles(ROLES.SUPER_ADMIN), validate(notificationIdParamSchema, 'params'), retryFailedNotification);

module.exports = router;

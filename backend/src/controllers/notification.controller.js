const notificationService = require('../services/notification.service');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Customer / Admin: Get My Notifications (Paginated)
 * Endpoint: GET /api/v1/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { notifications, pagination } = await notificationService.getUserNotifications(userId, req.query);
    return sendPaginated(res, 'Notifications fetched successfully', notifications, pagination, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer / Admin: Get Unread Notification Count
 * Endpoint: GET /api/v1/notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { count } = await notificationService.getUnreadCount(userId);
    return sendSuccess(res, 'Unread notification count fetched successfully', { count }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer / Admin: Mark Notification as Read (Strict Server-Side Ownership Enforced)
 * Endpoint: PATCH /api/v1/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { notification } = await notificationService.markAsRead(id, userId);
    return sendSuccess(res, 'Notification marked as read successfully', { notification }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin Only: Retry Failed Email Notification
 * Endpoint: POST /api/v1/admin/notifications/:id/retry
 */
const retryFailedNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notification, message } = await notificationService.retryFailedNotification(id);
    return sendSuccess(res, message, { notification }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  retryFailedNotification,
};

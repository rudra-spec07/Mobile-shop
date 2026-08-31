const { prisma } = require('../config/database');
const emailService = require('./email.service');
const { AppError } = require('../middleware/error.middleware');
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');
const env = require('../config/env');

/**
 * Helper: Find initial Super Admin user for System Notifications
 */
const getSuperAdminUserId = async () => {
  const admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN', isActive: true },
    select: { id: true, email: true },
  });
  return admin;
};

/**
 * Core Failure-Isolated Notification Creation Service
 */
const createNotification = async ({
  userId,
  type,
  channel = 'EMAIL',
  title,
  message,
  referenceId = null,
  referenceType = null,
  emailData = null,
}) => {
  try {
    if (!userId) return null;

    // 1. Deduplication check: Prevent identical notification for same user, type, and referenceId within 60s
    if (referenceId && type) {
      const recentDup = await prisma.notification.findFirst({
        where: {
          userId,
          type,
          referenceId,
          createdAt: { gt: new Date(Date.now() - 60 * 1000) },
        },
      });

      if (recentDup) {
        return recentDup; // Prevent spamming duplicate notifications
      }
    }

    // 2. Insert notification record into PostgreSQL with PENDING status
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        channel,
        title,
        message,
        referenceId,
        referenceType,
        status: 'PENDING',
      },
    });

    // 3. Attempt Email Delivery if channel is EMAIL or if user has email configured
    if (channel === 'EMAIL' || emailData) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      const recipientEmail = user?.email || emailData?.to;

      if (recipientEmail) {
        let dispatchRes = { success: false, error: 'Unrecognized notification type' };

        if (type === 'PASSWORD_RESET' && emailData?.resetUrl) {
          dispatchRes = await emailService.sendPasswordResetEmail({
            to: recipientEmail,
            userName: user?.name,
            resetUrl: emailData.resetUrl,
          });
        } else if (type === 'ACCOUNT_CREATED') {
          dispatchRes = await emailService.sendAccountCreatedEmail({
            to: recipientEmail,
            userName: user?.name,
          });
        } else if (type === 'ENQUIRY_CREATED') {
          dispatchRes = await emailService.sendEnquiryCreatedEmail({
            to: recipientEmail,
            userName: user?.name,
            enquirySubject: emailData?.subject || title,
            message: emailData?.message || message,
          });
        } else if (type === 'ENQUIRY_RESPONDED') {
          dispatchRes = await emailService.sendEnquiryResponseEmail({
            to: recipientEmail,
            userName: user?.name,
            enquirySubject: emailData?.subject || title,
            adminResponse: emailData?.adminResponse || message,
          });
        } else if (type === 'REQUEST_CREATED') {
          dispatchRes = await emailService.sendRequestCreatedEmail({
            to: recipientEmail,
            userName: user?.name,
            requestSubject: emailData?.subject || title,
            itemName: emailData?.itemName,
            quantity: emailData?.quantity,
            price: emailData?.price,
          });
        } else if (['REQUEST_CONFIRMED', 'REQUEST_PROCESSING', 'REQUEST_COMPLETED', 'REQUEST_CANCELLED'].includes(type)) {
          dispatchRes = await emailService.sendRequestStatusEmail({
            to: recipientEmail,
            userName: user?.name,
            requestSubject: emailData?.subject || title,
            itemName: emailData?.itemName,
            newStatus: emailData?.newStatus || type.replace('REQUEST_', ''),
            adminNotes: emailData?.adminNotes,
          });
        } else {
          // Generic fallback send
          dispatchRes = await emailService.sendEmail({
            to: recipientEmail,
            subject: title,
            html: `<p>${message}</p>`,
            text: message,
          });
        }

        // 4. Update status according to email result
        if (dispatchRes.success) {
          return await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
          });
        } else {
          return await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'FAILED',
              failureReason: dispatchRes.error || 'Email dispatch failed',
            },
          });
        }
      }
    }

    return notification;
  } catch (err) {
    // CRITICAL ZERO-REGRESSION & FAILURE ISOLATION RULE:
    // Never throw error or crash business operation if notification creation fails!
    console.error('⚠️ [NOTIFICATION SERVICE ERROR]:', err.message);
    return null;
  }
};

/**
 * Get User Notifications (Paginated & Ownership Enforced)
 */
const getUserNotifications = async (userId, { page = 1, limit = 10 }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return {
    notifications,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Get Unread Notification Count for User
 */
const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      readAt: null,
      status: { not: 'READ' },
    },
  });

  return { count };
};

/**
 * Mark Notification as Read (Strict Server-Side Ownership Enforced)
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    throw new AppError(
      'Notification not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  if (notification.readAt || notification.status === 'READ') {
    return { notification }; // Idempotent success if already read
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      readAt: new Date(),
      status: 'READ',
    },
  });

  return { notification: updated };
};

/**
 * Admin: Retry Failed Email Notification
 */
const retryFailedNotification = async (notificationId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!notification) {
    throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  if (!notification.user?.email) {
    throw new AppError('Target user has no valid email address', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
  }

  const dispatchRes = await emailService.sendEmail({
    to: notification.user.email,
    subject: notification.title,
    html: `<p>${notification.message}</p>`,
    text: notification.message,
  });

  if (dispatchRes.success) {
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        failureReason: null,
      },
    });
    return { notification: updated, message: 'Notification retried successfully' };
  } else {
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'FAILED',
        failureReason: dispatchRes.error || 'Retry delivery failed',
      },
    });
    return { notification: updated, message: 'Notification retry failed' };
  }
};

module.exports = {
  getSuperAdminUserId,
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  retryFailedNotification,
};

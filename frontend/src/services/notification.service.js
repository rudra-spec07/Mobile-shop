import apiClient from './api';

const notificationService = {
  /**
   * Fetch authenticated user notifications (Paginated).
   * @param {Object} params - Query parameters ({ page, limit, status })
   */
  getNotifications: async (params = {}) => {
    return await apiClient.get('/notifications', { params });
  },

  /**
   * Fetch unread notification count for authenticated user.
   */
  getUnreadCount: async () => {
    return await apiClient.get('/notifications/unread-count');
  },

  /**
   * Mark a specific notification as read.
   * @param {string} id - Notification UUID
   */
  markAsRead: async (id) => {
    return await apiClient.patch(`/notifications/${id}/read`);
  },
};

export default notificationService;

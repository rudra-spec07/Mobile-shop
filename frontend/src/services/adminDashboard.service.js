import apiClient from './api';

const adminDashboardService = {
  /**
   * Fetch overall admin dashboard statistics
   */
  getDashboard: async (options = {}) => {
    return await apiClient.get('/admin/dashboard', options);
  },

  /**
   * Fetch recent customer enquiries for dashboard feed
   */
  getRecentEnquiries: async (limit = 5, options = {}) => {
    return await apiClient.get('/admin/dashboard/recent-enquiries', { params: { limit }, ...options });
  },

  /**
   * Fetch recent customer service requests for dashboard feed
   */
  getRecentRequests: async (limit = 5, options = {}) => {
    return await apiClient.get('/admin/dashboard/recent-requests', { params: { limit }, ...options });
  },

  /**
   * Fetch attention / action required items for admin dashboard
   */
  getAttentionItems: async (options = {}) => {
    return await apiClient.get('/admin/dashboard/attention', options);
  },
};

export default adminDashboardService;

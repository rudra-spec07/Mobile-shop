import apiClient from './api';

const adminDashboardService = {
  /**
   * Fetch overall admin dashboard statistics
   */
  getDashboard: async () => {
    return await apiClient.get('/admin/dashboard');
  },

  /**
   * Fetch recent customer enquiries for dashboard feed
   */
  getRecentEnquiries: async (limit = 5) => {
    return await apiClient.get('/admin/dashboard/recent-enquiries', { params: { limit } });
  },

  /**
   * Fetch recent customer service requests for dashboard feed
   */
  getRecentRequests: async (limit = 5) => {
    return await apiClient.get('/admin/dashboard/recent-requests', { params: { limit } });
  },

  /**
   * Fetch attention / action required items for admin dashboard
   */
  getAttentionItems: async () => {
    return await apiClient.get('/admin/dashboard/attention');
  },
};

export default adminDashboardService;

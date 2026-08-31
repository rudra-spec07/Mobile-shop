import apiClient from './api';

const adminUserService = {
  /**
   * Super Admin: Fetch paginated list of users with search, status filter, and pagination
   */
  getAdminUsers: async (params = {}) => {
    return await apiClient.get('/admin/users', { params });
  },

  /**
   * Super Admin: Fetch single user details with transaction count by ID
   */
  getAdminUserById: async (id) => {
    return await apiClient.get(`/admin/users/${id}`);
  },

  /**
   * Super Admin: Update customer status (Activate / Deactivate)
   */
  updateUserStatus: async (id, payload) => {
    return await apiClient.patch(`/admin/users/${id}/status`, payload);
  },

  /**
   * Super Admin: Update customer details (name, mobileNumber)
   */
  updateUser: async (id, payload) => {
    return await apiClient.patch(`/admin/users/${id}`, payload);
  },
};

export default adminUserService;

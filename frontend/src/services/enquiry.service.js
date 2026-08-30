import apiClient from './api';

const enquiryService = {
  /**
   * Customer creates a new enquiry (General, Mobile, or Part).
   * customerId is derived server-side from JWT token.
   */
  createEnquiry: async (payload) => {
    return await apiClient.post('/enquiries', payload);
  },

  /**
   * Customer fetches their own enquiry list.
   */
  getMyEnquiries: async (params = {}) => {
    return await apiClient.get('/enquiries/my', { params });
  },

  /**
   * Customer or Admin fetches single enquiry details.
   */
  getEnquiryById: async (id) => {
    return await apiClient.get(`/enquiries/${id}`);
  },

  /**
   * Customer cancels their own enquiry.
   */
  cancelEnquiry: async (id) => {
    return await apiClient.patch(`/enquiries/${id}/cancel`);
  },

  /**
   * Super Admin lists all customer enquiries with search, filters & pagination.
   */
  getAdminEnquiries: async (params = {}) => {
    return await apiClient.get('/admin/enquiries', { params });
  },

  /**
   * Super Admin fetches single admin enquiry details.
   */
  getAdminEnquiryById: async (id) => {
    return await apiClient.get(`/admin/enquiries/${id}`);
  },

  /**
   * Super Admin submits response to customer enquiry.
   */
  respondToEnquiry: async (id, payload) => {
    return await apiClient.patch(`/admin/enquiries/${id}/respond`, payload);
  },

  /**
   * Super Admin updates enquiry status.
   */
  updateEnquiryStatus: async (id, payload) => {
    return await apiClient.patch(`/admin/enquiries/${id}/status`, payload);
  },
};

export default enquiryService;

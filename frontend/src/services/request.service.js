import apiClient from './api';

const requestService = {
  /**
   * Customer creates a new Service Request (Mobile or Part).
   * customerId is derived server-side from the authenticated JWT token.
   */
  createRequest: async (payload) => {
    return await apiClient.post('/requests', payload);
  },

  /**
   * Customer fetches their own service request history.
   */
  getMyRequests: async (params = {}, options = {}) => {
    return await apiClient.get('/requests/my', { params, ...options });
  },

  /**
   * Customer or Admin fetches single service request details.
   */
  getRequestById: async (id, options = {}) => {
    return await apiClient.get(`/requests/${id}`, options);
  },

  /**
   * Customer cancels or requests cancellation for their own request.
   */
  cancelRequest: async (id, payload = {}) => {
    return await apiClient.patch(`/requests/${id}/cancel`, payload);
  },

  /**
   * Super Admin lists all customer service requests with search, filters & pagination.
   */
  getAdminRequests: async (params = {}, options = {}) => {
    return await apiClient.get('/admin/requests', { params, ...options });
  },

  /**
   * Super Admin fetches single admin request details.
   */
  getAdminRequestById: async (id, options = {}) => {
    return await apiClient.get(`/admin/requests/${id}`, options);
  },

  /**
   * Super Admin confirms a PENDING request.
   */
  confirmRequest: async (id) => {
    return await apiClient.patch(`/admin/requests/${id}/confirm`);
  },

  /**
   * Super Admin sets a CONFIRMED request to PROCESSING.
   */
  processRequest: async (id) => {
    return await apiClient.patch(`/admin/requests/${id}/process`);
  },

  /**
   * Super Admin marks a PROCESSING request as COMPLETED.
   */
  completeRequest: async (id) => {
    return await apiClient.patch(`/admin/requests/${id}/complete`);
  },

  /**
   * Super Admin cancels an eligible request with optional reason.
   */
  cancelAdminRequest: async (id, payload = {}) => {
    return await apiClient.patch(`/admin/requests/${id}/cancel`, payload);
  },

  /**
   * Super Admin rejects customer cancellation request for PROCESSING item.
   */
  rejectCancellationRequest: async (id, payload = {}) => {
    return await apiClient.patch(`/admin/requests/${id}/reject-cancellation`, payload);
  },

  /**
   * Super Admin updates request status using generic status endpoint.
   */
  updateRequestStatus: async (id, payload) => {
    return await apiClient.patch(`/admin/requests/${id}/status`, payload);
  },
};

export default requestService;

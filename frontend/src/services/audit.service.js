import apiClient from './api';

/**
 * Fetch System Audit Logs (Super Admin Only)
 * Endpoint: GET /admin/audit-logs
 */
export const getAuditLogs = async (params = {}) => {
  return await apiClient.get('/admin/audit-logs', { params });
};

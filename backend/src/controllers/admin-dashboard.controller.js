const adminDashboardService = require('../services/admin-dashboard.service');
const { getAuditLogs: fetchAuditLogs } = require('../services/audit.service');
const { sendSuccess } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Controller for Super Admin Dashboard Overview
 * Endpoint: GET /api/v1/admin/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminDashboardService.getDashboardStatistics();
    return sendSuccess(res, 'Admin dashboard statistics retrieved successfully', { stats }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller for Recent Enquiries Widget
 * Endpoint: GET /api/v1/admin/dashboard/recent-enquiries
 */
const getRecentEnquiries = async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;
    const enquiries = await adminDashboardService.getRecentEnquiries(limit);
    return sendSuccess(res, 'Recent enquiries retrieved successfully', { enquiries }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller for Recent Requests Widget
 * Endpoint: GET /api/v1/admin/dashboard/recent-requests
 */
const getRecentRequests = async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;
    const requests = await adminDashboardService.getRecentRequests(limit);
    return sendSuccess(res, 'Recent requests retrieved successfully', { requests }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller for Attention / Action Required Items Widget
 * Endpoint: GET /api/v1/admin/dashboard/attention
 */
const getAttentionItems = async (req, res, next) => {
  try {
    const attention = await adminDashboardService.getAttentionItems();
    return sendSuccess(res, 'Attention items retrieved successfully', { attention }, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller for Audit Logs View
 * Endpoint: GET /api/v1/admin/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const result = await fetchAuditLogs(req.query);
    return sendSuccess(res, 'Audit logs retrieved successfully', result, HTTP_STATUS.OK);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboard,
  getRecentEnquiries,
  getRecentRequests,
  getAttentionItems,
  getAuditLogs,
};

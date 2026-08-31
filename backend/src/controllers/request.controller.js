const requestService = require('../services/request.service');
const {
  createRequestSchema,
  updateRequestStatusSchema,
  adminCancelSchema,
  requestQuerySchema,
} = require('../validators/request.validator');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Customer creates a new service request.
 * customerId comes strictly from req.user.userId.
 */
const createRequest = async (req, res, next) => {
  try {
    const validatedData = createRequestSchema.parse(req.body);
    const customerId = req.user.userId;

    const request = await requestService.createRequest(validatedData, customerId);
    return sendSuccess(res, 'Service request created successfully', { request }, HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer retrieves their own service request history.
 */
const getMyRequests = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const validatedQuery = requestQuerySchema.parse(req.query);

    const { requests, pagination } = await requestService.getCustomerRequests(customerId, validatedQuery);
    return sendPaginated(res, 'My service requests retrieved successfully', requests, pagination);
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer or Super Admin retrieves single request details.
 */
const getRequestById = async (req, res, next) => {
  try {
    const request = await requestService.getRequestById(req.params.id, req.user);
    return sendSuccess(res, 'Service request details retrieved successfully', { request });
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer cancels their own service request (direct for PENDING/CONFIRMED, request for PROCESSING).
 */
const cancelCustomerRequest = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const reason = req.body?.reason || null;
    const request = await requestService.cancelCustomerRequest(req.params.id, customerId, reason);
    const msg = request.cancellationRequested
      ? 'Cancellation request submitted and pending admin review'
      : 'Service request cancelled successfully';
    return sendSuccess(res, msg, { request });
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin lists all service requests with search, filters & pagination.
 */
const getAdminRequests = async (req, res, next) => {
  try {
    const validatedQuery = requestQuerySchema.parse(req.query);
    const { requests, pagination } = await requestService.getAdminRequests(validatedQuery);
    return sendPaginated(res, 'All service requests retrieved successfully', requests, pagination);
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin confirms a PENDING request.
 */
const confirmRequest = async (req, res, next) => {
  try {
    const request = await requestService.confirmRequest(req.params.id);
    return sendSuccess(res, 'Service request confirmed successfully', { request });
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin processes a CONFIRMED request.
 */
const processRequest = async (req, res, next) => {
  try {
    const request = await requestService.processRequest(req.params.id);
    return sendSuccess(res, 'Service request processing initiated successfully', { request });
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin completes a PROCESSING request.
 */
const completeRequest = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const request = await requestService.completeRequest(req.params.id, adminId);
    return sendSuccess(res, 'Service request completed successfully', { request });
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin cancels an eligible request.
 */
const adminCancelRequest = async (req, res, next) => {
  try {
    const { reason } = adminCancelSchema.parse(req.body || {});
    const request = await requestService.adminCancelRequest(req.params.id, reason);
    return sendSuccess(res, 'Service request cancelled by admin successfully', { request });
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin updates request status via generic status endpoint.
 */
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = updateRequestStatusSchema.parse(req.body);
    const adminNotes = req.body.adminNotes || req.body.reason || null;
    const adminId = req.user.userId;

    const request = await requestService.updateRequestStatus(req.params.id, status, adminNotes, adminId);
    return sendSuccess(res, 'Service request status updated successfully', { request });
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin rejects a customer's cancellation request for a PROCESSING item.
 */
const rejectCancellationRequest = async (req, res, next) => {
  try {
    const adminNotes = req.body?.adminNotes || req.body?.reason || null;
    const request = await requestService.rejectCancellationRequest(req.params.id, adminNotes);
    return sendSuccess(res, 'Customer cancellation request rejected successfully', { request });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getRequestById,
  cancelCustomerRequest,
  getAdminRequests,
  confirmRequest,
  processRequest,
  completeRequest,
  adminCancelRequest,
  rejectCancellationRequest,
  updateRequestStatus,
};

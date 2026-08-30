const enquiryService = require('../services/enquiry.service');
const {
  createEnquirySchema,
  adminResponseSchema,
  updateEnquiryStatusSchema,
  enquiryQuerySchema,
} = require('../validators/enquiry.validator');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Customer creates a new enquiry.
 * customerId comes strictly from req.user.id.
 */
const createEnquiry = async (req, res, next) => {
  try {
    const validatedData = createEnquirySchema.parse(req.body);
    const customerId = req.user.userId;

    const enquiry = await enquiryService.createEnquiry(validatedData, customerId);
    return sendSuccess(res, 'Enquiry created successfully', { enquiry }, HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer retrieves their own enquiry history.
 */
const getMyEnquiries = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const validatedQuery = enquiryQuerySchema.parse(req.query);

    const { enquiries, pagination } = await enquiryService.getCustomerEnquiries(customerId, validatedQuery);
    return sendPaginated(res, 'My enquiries retrieved successfully', enquiries, pagination);
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer or Admin retrieves single enquiry details.
 */
const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await enquiryService.getEnquiryById(req.params.id, req.user);
    return sendSuccess(res, 'Enquiry details retrieved successfully', { enquiry });
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer cancels their own enquiry.
 */
const cancelEnquiry = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const enquiry = await enquiryService.cancelEnquiry(req.params.id, customerId);
    return sendSuccess(res, 'Enquiry cancelled successfully', { enquiry });
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin lists all customer enquiries with search, filters & pagination.
 */
const getAdminEnquiries = async (req, res, next) => {
  try {
    const validatedQuery = enquiryQuerySchema.parse(req.query);
    const { enquiries, pagination } = await enquiryService.getAdminEnquiries(validatedQuery);
    return sendPaginated(res, 'All customer enquiries retrieved successfully', enquiries, pagination);
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin responds to a customer enquiry.
 */
const respondToEnquiry = async (req, res, next) => {
  try {
    const { response } = adminResponseSchema.parse(req.body);
    const adminId = req.user.userId;

    const enquiry = await enquiryService.respondToEnquiry(req.params.id, response, adminId);
    return sendSuccess(res, 'Response submitted successfully', { enquiry });
  } catch (error) {
    return next(error);
  }
};

/**
 * Super Admin updates enquiry status.
 */
const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status } = updateEnquiryStatusSchema.parse(req.body);
    const enquiry = await enquiryService.updateEnquiryStatus(req.params.id, status);
    return sendSuccess(res, 'Enquiry status updated successfully', { enquiry });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createEnquiry,
  getMyEnquiries,
  getEnquiryById,
  cancelEnquiry,
  getAdminEnquiries,
  respondToEnquiry,
  updateEnquiryStatus,
};

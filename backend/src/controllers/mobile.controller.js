const mobileService = require('../services/mobile.service');
const {
  createMobileSchema,
  updateMobileSchema,
  updateMobileStatusSchema,
  updateFeaturedSchema,
} = require('../validators/catalog.validator');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { HTTP_STATUS, ROLES } = require('../utils/constants');

const createMobile = async (req, res, next) => {
  try {
    const validatedData = createMobileSchema.parse(req.body);
    const mobile = await mobileService.createMobile(validatedData);
    return sendSuccess(res, 'Mobile model created successfully', { mobile }, HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

const getMobiles = async (req, res, next) => {
  try {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const { mobiles, pagination } = await mobileService.getMobiles(req.query, userRole);
    return sendPaginated(res, 'Mobiles retrieved successfully', mobiles, pagination);
  } catch (error) {
    return next(error);
  }
};

const getFeaturedMobiles = async (req, res, next) => {
  try {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const { mobiles, pagination } = await mobileService.getFeaturedMobiles(req.query, userRole);
    return sendPaginated(res, 'Featured mobiles retrieved successfully', mobiles, pagination);
  } catch (error) {
    return next(error);
  }
};

const getMobileById = async (req, res, next) => {
  try {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const mobile = await mobileService.getMobileById(req.params.id, userRole);
    return sendSuccess(res, 'Mobile details retrieved successfully', { mobile });
  } catch (error) {
    return next(error);
  }
};

const updateMobile = async (req, res, next) => {
  try {
    const validatedData = updateMobileSchema.parse(req.body);
    const mobile = await mobileService.updateMobile(req.params.id, validatedData);
    return sendSuccess(res, 'Mobile model updated successfully', { mobile });
  } catch (error) {
    return next(error);
  }
};

const updateMobileStatus = async (req, res, next) => {
  try {
    const validatedData = updateMobileStatusSchema.parse(req.body);
    const mobile = await mobileService.updateMobileStatus(req.params.id, validatedData.status);
    return sendSuccess(res, `Mobile status updated to ${validatedData.status}`, { mobile });
  } catch (error) {
    return next(error);
  }
};

const updateFeaturedStatus = async (req, res, next) => {
  try {
    const validatedData = updateFeaturedSchema.parse(req.body);
    const mobile = await mobileService.updateFeaturedStatus(req.params.id, validatedData.featured);
    return sendSuccess(res, `Mobile featured status updated to ${validatedData.featured}`, { mobile });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createMobile,
  getMobiles,
  getFeaturedMobiles,
  getMobileById,
  updateMobile,
  updateMobileStatus,
  updateFeaturedStatus,
};

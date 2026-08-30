const partService = require('../services/part.service');
const {
  createPartSchema,
  updatePartSchema,
  updatePartStatusSchema,
} = require('../validators/part.validator');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { HTTP_STATUS, ROLES } = require('../utils/constants');

const createPart = async (req, res, next) => {
  try {
    const validatedData = createPartSchema.parse(req.body);
    const userId = req.user?.id || req.user?.email || 'SUPER_ADMIN';
    const part = await partService.createPart(validatedData, userId);
    return sendSuccess(res, 'Part created successfully', { part }, HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

const getParts = async (req, res, next) => {
  try {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const { parts, pagination } = await partService.getParts(req.query, userRole);
    return sendPaginated(res, 'Parts retrieved successfully', parts, pagination);
  } catch (error) {
    return next(error);
  }
};

const getPartById = async (req, res, next) => {
  try {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const part = await partService.getPartById(req.params.id, userRole);
    return sendSuccess(res, 'Part details retrieved successfully', { part });
  } catch (error) {
    return next(error);
  }
};

const updatePart = async (req, res, next) => {
  try {
    const validatedData = updatePartSchema.parse(req.body);
    const part = await partService.updatePart(req.params.id, validatedData);
    return sendSuccess(res, 'Part updated successfully', { part });
  } catch (error) {
    return next(error);
  }
};

const updatePartStatus = async (req, res, next) => {
  try {
    const validatedData = updatePartStatusSchema.parse(req.body);
    const part = await partService.updatePartStatus(req.params.id, validatedData.status);
    return sendSuccess(res, `Part status updated to ${validatedData.status}`, { part });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPart,
  getParts,
  getPartById,
  updatePart,
  updatePartStatus,
};

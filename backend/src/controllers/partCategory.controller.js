const partCategoryService = require('../services/partCategory.service');
const {
  createPartCategorySchema,
  updatePartCategorySchema,
  updatePartCategoryStatusSchema,
} = require('../validators/part.validator');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { HTTP_STATUS, ROLES } = require('../utils/constants');

const createCategory = async (req, res, next) => {
  try {
    const validatedData = createPartCategorySchema.parse(req.body);
    const category = await partCategoryService.createCategory(validatedData);
    return sendSuccess(res, 'Part category created successfully', { category }, HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const { categories, pagination } = await partCategoryService.getCategories(req.query, userRole);
    return sendPaginated(res, 'Part categories retrieved successfully', categories, pagination);
  } catch (error) {
    return next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const category = await partCategoryService.getCategoryById(req.params.id, userRole);
    return sendSuccess(res, 'Part category details retrieved successfully', { category });
  } catch (error) {
    return next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const validatedData = updatePartCategorySchema.parse(req.body);
    const category = await partCategoryService.updateCategory(req.params.id, validatedData);
    return sendSuccess(res, 'Part category updated successfully', { category });
  } catch (error) {
    return next(error);
  }
};

const updateCategoryStatus = async (req, res, next) => {
  try {
    const validatedData = updatePartCategoryStatusSchema.parse(req.body);
    const category = await partCategoryService.updateCategoryStatus(req.params.id, validatedData.status);
    return sendSuccess(res, `Part category status updated to ${validatedData.status}`, { category });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
};

const brandService = require('../services/brand.service');
const { createBrandSchema, updateBrandSchema, updateBrandStatusSchema } = require('../validators/catalog.validator');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { HTTP_STATUS, ROLES } = require('../utils/constants');

const createBrand = async (req, res, next) => {
  try {
    const validatedData = createBrandSchema.parse(req.body);
    const brand = await brandService.createBrand(validatedData);
    return sendSuccess(res, 'Brand created successfully', { brand }, HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

const getBrands = async (req, res, next) => {
  try {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const { brands, pagination } = await brandService.getBrands(req.query, userRole);
    return sendPaginated(res, 'Brands retrieved successfully', brands, pagination);
  } catch (error) {
    return next(error);
  }
};

const getBrandById = async (req, res, next) => {
  try {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const brand = await brandService.getBrandById(req.params.id, userRole);
    return sendSuccess(res, 'Brand details retrieved successfully', { brand });
  } catch (error) {
    return next(error);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    const validatedData = updateBrandSchema.parse(req.body);
    const brand = await brandService.updateBrand(req.params.id, validatedData);
    return sendSuccess(res, 'Brand updated successfully', { brand });
  } catch (error) {
    return next(error);
  }
};

const updateBrandStatus = async (req, res, next) => {
  try {
    const validatedData = updateBrandStatusSchema.parse(req.body);
    const brand = await brandService.updateBrandStatus(req.params.id, validatedData.status);
    return sendSuccess(res, `Brand status updated to ${validatedData.status}`, { brand });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  updateBrandStatus,
};

const inventoryService = require('../services/inventory.service');
const {
  stockInSchema,
  stockOutSchema,
  stockAdjustmentSchema,
} = require('../validators/part.validator');
const { sendSuccess, sendPaginated } = require('../utils/response');

const stockIn = async (req, res, next) => {
  try {
    const validatedData = stockInSchema.parse(req.body);
    const userId = req.user?.id || req.user?.email || 'SUPER_ADMIN';
    const result = await inventoryService.stockIn(req.params.id, validatedData.quantity, userId);
    return sendSuccess(res, 'Stock added successfully', result);
  } catch (error) {
    return next(error);
  }
};

const stockOut = async (req, res, next) => {
  try {
    const validatedData = stockOutSchema.parse(req.body);
    const userId = req.user?.id || req.user?.email || 'SUPER_ADMIN';
    const result = await inventoryService.stockOut(req.params.id, validatedData.quantity, userId);
    return sendSuccess(res, 'Stock issued successfully', result);
  } catch (error) {
    return next(error);
  }
};

const stockAdjustment = async (req, res, next) => {
  try {
    const validatedData = stockAdjustmentSchema.parse(req.body);
    const userId = req.user?.id || req.user?.email || 'SUPER_ADMIN';
    const result = await inventoryService.stockAdjustment(
      req.params.id,
      validatedData.newQuantity,
      validatedData.reason,
      userId
    );
    return sendSuccess(res, 'Stock adjusted successfully', result);
  } catch (error) {
    return next(error);
  }
};

const getInventoryHistory = async (req, res, next) => {
  try {
    const { history, pagination } = await inventoryService.getInventoryHistory(req.params.id, req.query);
    return sendPaginated(res, 'Inventory history retrieved successfully', history, pagination);
  } catch (error) {
    return next(error);
  }
};

const getLowStockReport = async (req, res, next) => {
  try {
    const { parts, pagination } = await inventoryService.getLowStockReport(req.query);
    return sendPaginated(res, 'Low stock items retrieved successfully', parts, pagination);
  } catch (error) {
    return next(error);
  }
};

const getOutOfStockReport = async (req, res, next) => {
  try {
    const { parts, pagination } = await inventoryService.getOutOfStockReport(req.query);
    return sendPaginated(res, 'Out of stock items retrieved successfully', parts, pagination);
  } catch (error) {
    return next(error);
  }
};

const getInventorySummary = async (req, res, next) => {
  try {
    const summary = await inventoryService.getInventorySummary();
    return sendSuccess(res, 'Inventory summary retrieved successfully', { summary });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  stockIn,
  stockOut,
  stockAdjustment,
  getInventoryHistory,
  getLowStockReport,
  getOutOfStockReport,
  getInventorySummary,
};

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/error.middleware');
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');
const { parsePagination } = require('../utils/pagination');
const { formatPartForAdmin, calculateStockStatus } = require('./part.service');
const notificationService = require('./notification.service');

const stockIn = async (partId, quantity, userId) => {
  if (!quantity || quantity <= 0) {
    throw new AppError('Stock-in quantity must be greater than 0', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_QUANTITY);
  }

  const part = await prisma.part.findUnique({
    where: { id: partId },
  });

  if (!part) {
    throw new AppError('Part not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_NOT_FOUND);
  }

  const previousQuantity = part.quantity;
  const newQuantity = previousQuantity + quantity;

  const result = await prisma.$transaction(async (tx) => {
    const updatedPart = await tx.part.update({
      where: { id: partId },
      data: { quantity: newQuantity },
      include: { category: true },
    });

    const transaction = await tx.inventoryTransaction.create({
      data: {
        partId,
        type: 'STOCK_IN',
        quantity,
        previousQuantity,
        newQuantity,
        reason: 'Stock In',
        performedBy: userId || 'SYSTEM',
      },
    });

    return { part: updatedPart, transaction };
  });

  const { createAuditLog } = require('./audit.service');
  createAuditLog({
    userId,
    action: 'STOCK_IN',
    entityType: 'Part',
    entityId: partId,
    oldValue: { quantity: previousQuantity },
    newValue: { quantity: newQuantity },
  });

  return {
    part: formatPartForAdmin(result.part),
    transaction: result.transaction,
  };
};

const stockOut = async (partId, quantity, userId) => {
  if (!quantity || quantity <= 0) {
    throw new AppError('Stock-out quantity must be greater than 0', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_QUANTITY);
  }

  const part = await prisma.part.findUnique({
    where: { id: partId },
  });

  if (!part) {
    throw new AppError('Part not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_NOT_FOUND);
  }

  if (part.quantity < quantity) {
    throw new AppError(
      `Insufficient stock available for part ${part.partNumber}. Available: ${part.quantity}, Requested: ${quantity}`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INSUFFICIENT_STOCK
    );
  }

  const previousQuantity = part.quantity;
  const newQuantity = previousQuantity - quantity;

  const result = await prisma.$transaction(async (tx) => {
    const updatedPart = await tx.part.update({
      where: { id: partId },
      data: { quantity: newQuantity },
      include: { category: true },
    });

    const transaction = await tx.inventoryTransaction.create({
      data: {
        partId,
        type: 'STOCK_OUT',
        quantity,
        previousQuantity,
        newQuantity,
        reason: 'Stock Out',
        performedBy: userId || 'SYSTEM',
      },
    });

    return { part: updatedPart, transaction };
  });

  if (newQuantity <= result.part.minimumStock && previousQuantity > result.part.minimumStock) {
    notificationService.getSuperAdminUserId().then((admin) => {
      if (admin) {
        notificationService.createNotification({
          userId: admin.id,
          type: 'LOW_STOCK',
          channel: 'SYSTEM',
          title: 'Low Stock Alert',
          message: `${result.part.name} has reached its minimum stock level (${newQuantity} remaining, minimum threshold: ${result.part.minimumStock}).`,
          referenceId: result.part.id,
          referenceType: 'PART',
        }).catch(() => {});
      }
    }).catch(() => {});
  }

  const { createAuditLog } = require('./audit.service');
  createAuditLog({
    userId,
    action: 'STOCK_OUT',
    entityType: 'Part',
    entityId: partId,
    oldValue: { quantity: previousQuantity },
    newValue: { quantity: newQuantity },
  });

  return {
    part: formatPartForAdmin(result.part),
    transaction: result.transaction,
  };
};

const stockAdjustment = async (partId, newQuantity, reason, userId) => {
  if (newQuantity === undefined || newQuantity === null || newQuantity < 0) {
    throw new AppError('New quantity cannot be negative', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_STOCK_ADJUSTMENT);
  }

  if (!reason || !reason.trim()) {
    throw new AppError('Reason for stock adjustment is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_STOCK_ADJUSTMENT);
  }

  const part = await prisma.part.findUnique({
    where: { id: partId },
  });

  if (!part) {
    throw new AppError('Part not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_NOT_FOUND);
  }

  const previousQuantity = part.quantity;
  const deltaQuantity = Math.abs(newQuantity - previousQuantity);

  const result = await prisma.$transaction(async (tx) => {
    const updatedPart = await tx.part.update({
      where: { id: partId },
      data: { quantity: newQuantity },
      include: { category: true },
    });

    const transaction = await tx.inventoryTransaction.create({
      data: {
        partId,
        type: 'ADJUSTMENT',
        quantity: deltaQuantity,
        previousQuantity,
        newQuantity,
        reason: reason.trim(),
        performedBy: userId || 'SYSTEM',
      },
    });

    return { part: updatedPart, transaction };
  });

  if (newQuantity <= result.part.minimumStock && previousQuantity > result.part.minimumStock) {
    notificationService.getSuperAdminUserId().then((admin) => {
      if (admin) {
        notificationService.createNotification({
          userId: admin.id,
          type: 'LOW_STOCK',
          channel: 'SYSTEM',
          title: 'Low Stock Alert',
          message: `${result.part.name} has reached its minimum stock level (${newQuantity} remaining, minimum threshold: ${result.part.minimumStock}).`,
          referenceId: result.part.id,
          referenceType: 'PART',
        }).catch(() => {});
      }
    }).catch(() => {});
  }

  const { createAuditLog } = require('./audit.service');
  createAuditLog({
    userId,
    action: 'STOCK_ADJUSTMENT',
    entityType: 'Part',
    entityId: partId,
    oldValue: { quantity: previousQuantity },
    newValue: { quantity: newQuantity, reason },
  });

  return {
    part: formatPartForAdmin(result.part),
    transaction: result.transaction,
  };
};

const getInventoryHistory = async (partId, query = {}) => {
  const part = await prisma.part.findUnique({
    where: { id: partId },
  });

  if (!part) {
    throw new AppError('Part not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_NOT_FOUND);
  }

  const { page, limit, skip } = parsePagination(query);

  const history = await prisma.inventoryTransaction.findMany({
    where: { partId },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  const total = await prisma.inventoryTransaction.count({
    where: { partId },
  });

  return {
    history,
    pagination: { page, limit, total },
  };
};

const getLowStockReport = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const allParts = await prisma.part.findMany({
    orderBy: { quantity: 'asc' },
    include: { category: true },
  });

  const lowStockParts = allParts
    .filter((p) => p.quantity > 0 && p.quantity <= p.minimumStock)
    .map((p) => formatPartForAdmin(p));

  const total = lowStockParts.length;
  const paginatedParts = lowStockParts.slice(skip, skip + limit);

  return {
    parts: paginatedParts,
    pagination: { page, limit, total },
  };
};

const getOutOfStockReport = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const allParts = await prisma.part.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });

  const outOfStockParts = allParts
    .filter((p) => p.quantity === 0)
    .map((p) => formatPartForAdmin(p));

  const total = outOfStockParts.length;
  const paginatedParts = outOfStockParts.slice(skip, skip + limit);

  return {
    parts: paginatedParts,
    pagination: { page, limit, total },
  };
};

const getInventorySummary = async () => {
  const allParts = await prisma.part.findMany({
    select: {
      id: true,
      quantity: true,
      minimumStock: true,
    },
  });

  let totalParts = allParts.length;
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;

  for (const part of allParts) {
    if (part.quantity === 0) {
      outOfStock++;
    } else if (part.quantity <= part.minimumStock) {
      lowStock++;
    } else {
      inStock++;
    }
  }

  return {
    totalParts,
    inStock,
    lowStock,
    outOfStock,
  };
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

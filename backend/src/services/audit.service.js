const { prisma } = require('../config/database');

/**
 * Sanitizes object data before writing to audit logs to ensure sensitive details are never logged.
 */
const sanitizeAuditData = (data) => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveKeys = [
    'password',
    'passwordHash',
    'resetToken',
    'resetTokenHash',
    'token',
    'jwtSecret',
    'authorization',
  ];

  const sanitized = { ...data };
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      delete sanitized[key];
    }
  }

  return sanitized;
};

/**
 * Creates an audit log entry in the database.
 * Fails gracefully without throwing to protect primary application business flows.
 *
 * @param {Object} params
 * @param {string} [params.userId] - ID of user performing the action
 * @param {string} params.action - Descriptive action tag (e.g., MOBILE_CREATE)
 * @param {string} [params.entityType] - Target entity type (e.g., Mobile, ServiceRequest)
 * @param {string} [params.entityId] - ID of affected entity
 * @param {Object} [params.oldValue] - State before change
 * @param {Object} [params.newValue] - State after change
 * @param {string} [params.ipAddress] - Request IP address
 * @param {string} [params.userAgent] - Request User-Agent header
 */
const createAuditLog = async ({
  userId = null,
  action,
  entityType = null,
  entityId = null,
  oldValue = null,
  newValue = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    const cleanOldValue = oldValue ? sanitizeAuditData(oldValue) : null;
    const cleanNewValue = newValue ? sanitizeAuditData(newValue) : null;

    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        oldValue: cleanOldValue,
        newValue: cleanNewValue,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('⚠️ [AuditLog Error]: Failed to create audit log entry:', error.message);
    return null;
  }
};

/**
 * Fetch audit logs with pagination and filters (for Super Admin auditing).
 */
const getAuditLogs = async (query = {}) => {
  const { page = 1, limit = 20, userId, action, entityType } = query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

module.exports = {
  createAuditLog,
  getAuditLogs,
};

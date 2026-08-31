const { prisma } = require('../config/database');
const { parsePagination } = require('../utils/pagination');
const AppError = require('../middleware/error.middleware').AppError;
const { HTTP_STATUS, ERROR_CODES, ROLES } = require('../utils/constants');
const notificationService = require('./notification.service');

/**
 * Helper to format ServiceRequest response payload.
 */
const formatRequest = (request, isSuperAdmin = false) => {
  return {
    id: request.id,
    customerId: request.customerId,
    customer: request.customer
      ? {
          id: request.customer.id,
          name: request.customer.name,
          email: request.customer.email,
          mobileNumber: request.customer.mobileNumber,
        }
      : undefined,
    mobileId: request.mobileId,
    mobile: request.mobile
      ? {
          id: request.mobile.id,
          name: request.mobile.name,
          modelNumber: request.mobile.modelNumber,
          price: request.mobile.price,
          sellingPrice: request.mobile.sellingPrice,
          status: request.mobile.status,
        }
      : undefined,
    partId: request.partId,
    part: request.part
      ? {
          id: request.part.id,
          name: request.part.name,
          partNumber: request.part.partNumber,
          price: request.part.price,
          quantity: request.part.quantity,
          status: request.part.status,
        }
      : undefined,
    quantity: request.quantity,
    price: request.price,
    subject: request.subject,
    notes: request.notes,
    status: request.status,
    cancellationRequested: Boolean(request.cancellationRequested),
    cancellationReason: request.cancellationReason || null,
    adminNotes: isSuperAdmin ? request.adminNotes : undefined,
    processedBy: request.processedBy,
    processedAt: request.processedAt,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
};

/**
 * Customer creates a new Service Request.
 * customerId comes strictly from the authenticated JWT.
 */
const createRequest = async (data, customerId) => {
  const { mobileId, partId, quantity, subject, notes } = data;

  if (quantity < 1) {
    throw new AppError('Quantity must be greater than or equal to 1', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_REQUEST_QUANTITY);
  }

  let priceSnapshot = null;

  // Validate referenced Mobile if provided
  if (mobileId) {
    const mobile = await prisma.mobile.findUnique({ where: { id: mobileId } });
    if (!mobile || mobile.status !== 'ACTIVE') {
      throw new AppError('Mobile model is not active or available for request', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.MOBILE_NOT_AVAILABLE);
    }
    priceSnapshot = mobile.sellingPrice !== null && mobile.sellingPrice !== undefined ? mobile.sellingPrice : mobile.price;
  }

  // Validate referenced Part if provided
  if (partId) {
    const part = await prisma.part.findUnique({ where: { id: partId } });
    if (!part || part.status !== 'ACTIVE') {
      throw new AppError('Spare part is not active or available for request', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.PART_NOT_AVAILABLE);
    }
    if (part.quantity < quantity) {
      throw new AppError(
        `Requested quantity (${quantity}) exceeds available stock (${part.quantity})`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INSUFFICIENT_STOCK
      );
    }
    priceSnapshot = part.price;
  }

  const request = await prisma.serviceRequest.create({
    data: {
      customerId,
      mobileId: mobileId || null,
      partId: partId || null,
      quantity,
      price: priceSnapshot,
      subject: subject || null,
      notes: notes || null,
      status: 'PENDING',
    },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
    },
  });

  // Trigger Notifications (Failure Isolated)
  const itemName = request.mobile?.name || request.part?.name || 'Service Item';
  notificationService.createNotification({
    userId: customerId,
    type: 'REQUEST_CREATED',
    channel: 'EMAIL',
    title: `Service Request Submitted: "${itemName}"`,
    message: `Your request for ${itemName} has been created and is pending confirmation.`,
    referenceId: request.id,
    referenceType: 'SERVICE_REQUEST',
    emailData: {
      subject: request.subject,
      itemName,
      quantity: request.quantity,
      price: request.price,
    },
  }).catch(() => {});

  notificationService.getSuperAdminUserId().then((admin) => {
    if (admin) {
      notificationService.createNotification({
        userId: admin.id,
        type: 'REQUEST_CREATED',
        channel: 'SYSTEM',
        title: 'New Service Request Received',
        message: `New service request from ${request.customer?.name || 'Customer'} for ${itemName}`,
        referenceId: request.id,
        referenceType: 'SERVICE_REQUEST',
      }).catch(() => {});
    }
  }).catch(() => {});

  return formatRequest(request, false);
};

/**
 * Customer fetches their own service request list.
 */
const getCustomerRequests = async (customerId, query = {}) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where = { customerId };

  if (query.status) {
    where.status = query.status;
  }

  const [total, requests] = await prisma.$transaction([
    prisma.serviceRequest.count({ where }),
    prisma.serviceRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
        mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
        part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
      },
    }),
  ]);

  return {
    requests: requests.map((r) => formatRequest(r, false)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get single request details.
 * Customer can ONLY view their own request. Super Admin can view any request.
 */
const getRequestById = async (requestId, user) => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
    },
  });

  if (!request) {
    throw new AppError('Request not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.REQUEST_NOT_FOUND);
  }

  const isSuperAdmin = user.role === ROLES.SUPER_ADMIN;

  // Ownership Check for Customer
  if (!isSuperAdmin && request.customerId !== user.userId) {
    throw new AppError('Request not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.REQUEST_NOT_FOUND);
  }

  return formatRequest(request, isSuperAdmin);
};

/**
 * Customer cancels or requests cancellation for their own request.
 * - PENDING or CONFIRMED: Immediate direct cancellation to CANCELLED.
 * - PROCESSING: Submits a cancellation request (cancellationRequested = true), pending Super Admin review.
 */
const cancelCustomerRequest = async (requestId, customerId, reason = null) => {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });

  if (!request || request.customerId !== customerId) {
    throw new AppError('Request not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.REQUEST_NOT_FOUND);
  }

  if (request.status === 'COMPLETED') {
    throw new AppError('Cannot cancel a completed request', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.REQUEST_ALREADY_COMPLETED);
  }

  if (request.status === 'CANCELLED') {
    throw new AppError('Request is already cancelled', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.REQUEST_ALREADY_CANCELLED);
  }

  // Handle PROCESSING status: Record cancellation request
  if (request.status === 'PROCESSING') {
    if (request.cancellationRequested) {
      throw new AppError('Cancellation request has already been submitted and is pending admin review', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.DUPLICATE_DATA);
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        cancellationRequested: true,
        cancellationReason: reason ? reason.trim() : null,
      },
      include: {
        customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
        mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
        part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
      },
    });

    // Trigger System Notification to Super Admin (Failure Isolated)
    const itemName = updated.mobile?.name || updated.part?.name || 'Service Request';
    notificationService.getSuperAdminUserId().then((admin) => {
      if (admin) {
        notificationService.createNotification({
          userId: admin.id,
          type: 'CANCELLATION_REQUESTED',
          channel: 'SYSTEM',
          title: `Cancellation Requested: "${itemName}"`,
          message: `Customer ${updated.customer?.name || 'Customer'} requested cancellation for ${itemName}.${reason ? ` Reason: "${reason.trim()}"` : ''}`,
          referenceId: updated.id,
          referenceType: 'SERVICE_REQUEST',
        }).catch(() => {});
      }
    }).catch(() => {});

    return formatRequest(updated, false);
  }

  if (!['PENDING', 'CONFIRMED'].includes(request.status)) {
    throw new AppError(`Cannot cancel request in '${request.status}' status`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_STATUS_TRANSITION);
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      status: 'CANCELLED',
      cancellationRequested: false,
      cancellationReason: reason ? reason.trim() : request.cancellationReason,
    },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
    },
  });

  return formatRequest(updated, false);
};

/**
 * Super Admin lists all requests with search, filtering, sorting, and pagination.
 */
const getAdminRequests = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const search = query.search?.trim();

  const where = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.mobileId) {
    where.mobileId = query.mobileId;
  }

  if (query.partId) {
    where.partId = query.partId;
  }

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  if (search) {
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { email: { contains: search, mode: 'insensitive' } } },
      { mobile: { name: { contains: search, mode: 'insensitive' } } },
      { part: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  // Sorting
  let orderBy = { createdAt: 'desc' };
  if (query.sort === 'oldest' || query.sortOrder?.toLowerCase() === 'asc') {
    orderBy = { createdAt: 'asc' };
  }

  const [total, requests] = await prisma.$transaction([
    prisma.serviceRequest.count({ where }),
    prisma.serviceRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
        mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
        part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
      },
    }),
  ]);

  return {
    requests: requests.map((r) => formatRequest(r, true)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Super Admin confirms a PENDING request.
 * Transition: PENDING -> CONFIRMED
 */
const confirmRequest = async (requestId) => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { mobile: true, part: true },
  });

  if (!request) {
    throw new AppError('Request not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.REQUEST_NOT_FOUND);
  }

  if (request.status !== 'PENDING') {
    throw new AppError(
      `Cannot confirm request in '${request.status}' status. Only PENDING requests can be confirmed.`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_STATUS_TRANSITION
    );
  }

  // Re-verify availability before confirming
  if (request.mobileId) {
    if (!request.mobile || request.mobile.status !== 'ACTIVE') {
      throw new AppError('Referenced mobile model is no longer active', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.MOBILE_NOT_AVAILABLE);
    }
  }

  if (request.partId) {
    if (!request.part || request.part.status !== 'ACTIVE') {
      throw new AppError('Referenced spare part is no longer active', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.PART_NOT_AVAILABLE);
    }
    if (request.part.quantity < request.quantity) {
      throw new AppError('Insufficient stock available for spare part', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INSUFFICIENT_STOCK);
    }
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: 'CONFIRMED' },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
    },
  });

  const itemName = updated.mobile?.name || updated.part?.name || 'Service Item';
  notificationService.createNotification({
    userId: updated.customerId,
    type: 'REQUEST_CONFIRMED',
    channel: 'EMAIL',
    title: `Request Confirmed: "${itemName}"`,
    message: `Your service request for ${itemName} has been confirmed.`,
    referenceId: updated.id,
    referenceType: 'SERVICE_REQUEST',
    emailData: { itemName, newStatus: 'CONFIRMED' },
  }).catch(() => {});

  return formatRequest(updated, true);
};

/**
 * Super Admin marks CONFIRMED request as PROCESSING.
 * Transition: CONFIRMED -> PROCESSING
 */
const processRequest = async (requestId) => {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });

  if (!request) {
    throw new AppError('Request not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.REQUEST_NOT_FOUND);
  }

  if (request.status !== 'CONFIRMED') {
    throw new AppError(
      `Cannot set request to processing from '${request.status}' status. Only CONFIRMED requests can be set to PROCESSING.`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_STATUS_TRANSITION
    );
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: 'PROCESSING' },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
    },
  });

  const itemName = updated.mobile?.name || updated.part?.name || 'Service Item';
  notificationService.createNotification({
    userId: updated.customerId,
    type: 'REQUEST_PROCESSING',
    channel: 'EMAIL',
    title: `Request In Processing: "${itemName}"`,
    message: `Your service request for ${itemName} is now in processing.`,
    referenceId: updated.id,
    referenceType: 'SERVICE_REQUEST',
    emailData: { itemName, newStatus: 'PROCESSING' },
  }).catch(() => {});

  return formatRequest(updated, true);
};

/**
 * Super Admin marks PROCESSING request as COMPLETED.
 * Transition: PROCESSING -> COMPLETED
 * Sets processedBy and processedAt.
 */
const completeRequest = async (requestId, adminId) => {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });

  if (!request) {
    throw new AppError('Request not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.REQUEST_NOT_FOUND);
  }

  if (request.status !== 'PROCESSING') {
    throw new AppError(
      `Cannot complete request in '${request.status}' status. Only PROCESSING requests can be completed.`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_STATUS_TRANSITION
    );
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      status: 'COMPLETED',
      cancellationRequested: false,
      processedBy: adminId,
      processedAt: new Date(),
    },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
    },
  });

  const itemName = updated.mobile?.name || updated.part?.name || 'Service Item';
  notificationService.createNotification({
    userId: updated.customerId,
    type: 'REQUEST_COMPLETED',
    channel: 'EMAIL',
    title: `Request Completed: "${itemName}"`,
    message: `Your service request for ${itemName} has been marked COMPLETED.`,
    referenceId: updated.id,
    referenceType: 'SERVICE_REQUEST',
    emailData: { itemName, newStatus: 'COMPLETED' },
  }).catch(() => {});

  return formatRequest(updated, true);
};

/**
 * Super Admin cancels an eligible request (PENDING, CONFIRMED, or PROCESSING).
 */
const adminCancelRequest = async (requestId, reason = null) => {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });

  if (!request) {
    throw new AppError('Request not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.REQUEST_NOT_FOUND);
  }

  if (request.status === 'COMPLETED') {
    throw new AppError('Cannot cancel a completed request', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.REQUEST_ALREADY_COMPLETED);
  }

  if (request.status === 'CANCELLED') {
    throw new AppError('Request is already cancelled', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.REQUEST_ALREADY_CANCELLED);
  }

  if (!['PENDING', 'CONFIRMED', 'PROCESSING'].includes(request.status)) {
    throw new AppError(`Cannot cancel request in '${request.status}' status`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_STATUS_TRANSITION);
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      status: 'CANCELLED',
      cancellationRequested: false,
      adminNotes: reason ? reason.trim() : request.adminNotes,
      cancellationReason: reason ? reason.trim() : request.cancellationReason,
    },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
    },
  });

  const itemName = updated.mobile?.name || updated.part?.name || 'Service Item';
  notificationService.createNotification({
    userId: updated.customerId,
    type: 'REQUEST_CANCELLED',
    channel: 'EMAIL',
    title: `Request Cancelled: "${itemName}"`,
    message: `Your service request for ${itemName} has been CANCELLED.`,
    referenceId: updated.id,
    referenceType: 'SERVICE_REQUEST',
    emailData: { itemName, newStatus: 'CANCELLED', adminNotes: reason },
  }).catch(() => {});

  return formatRequest(updated, true);
};

/**
 * Super Admin rejects a customer's cancellation request for a PROCESSING item.
 */
const rejectCancellationRequest = async (requestId, adminNotes = null) => {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });

  if (!request) {
    throw new AppError('Request not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.REQUEST_NOT_FOUND);
  }

  const trimmedNotes = typeof adminNotes === 'string' ? adminNotes.trim() : '';
  if (!trimmedNotes) {
    throw new AppError('Please provide a reason for rejecting the cancellation request.', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }

  if (trimmedNotes.length > 500) {
    throw new AppError('Rejection reason cannot exceed 500 characters', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      cancellationRequested: false,
      adminNotes: trimmedNotes,
    },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
    },
  });

  // Trigger Notification for Customer (Failure Isolated)
  const itemName = updated.mobile?.name || updated.part?.name || updated.subject || 'Service Request';
  notificationService.createNotification({
    userId: updated.customerId,
    type: 'CANCELLATION_REJECTED',
    channel: 'EMAIL',
    title: 'Cancellation Request Rejected',
    message: `Your cancellation request for "${itemName}" was rejected.\n\nMessage from Mobile-Adda Admin:\n"${trimmedNotes}"\n\nYour service request will continue processing.`,
    referenceId: updated.id,
    referenceType: 'SERVICE_REQUEST',
    emailData: {
      itemName,
      newStatus: 'PROCESSING',
      adminNotes: trimmedNotes,
    },
  }).catch(() => {});

  return formatRequest(updated, true);
};

/**
 * Generic Admin Status Update function enforcing full lifecycle state machine rules.
 */
const updateRequestStatus = async (requestId, newStatus, adminNotes = null, adminId = null) => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { mobile: true, part: true },
  });

  if (!request) {
    throw new AppError('Request not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.REQUEST_NOT_FOUND);
  }

  const currentStatus = request.status;

  if (currentStatus === newStatus) {
    return formatRequest(request, true);
  }

  if (currentStatus === 'COMPLETED') {
    throw new AppError('Cannot modify status of a completed request', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.REQUEST_ALREADY_COMPLETED);
  }

  if (currentStatus === 'CANCELLED') {
    throw new AppError('Cannot modify status of a cancelled request', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.REQUEST_ALREADY_CANCELLED);
  }

  // Strict lifecycle state transition table
  const allowedTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['COMPLETED'],
  };

  const validNextStates = allowedTransitions[currentStatus] || [];
  if (!validNextStates.includes(newStatus)) {
    throw new AppError(
      `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_STATUS_TRANSITION
    );
  }

  // Item re-validation when confirming
  if (newStatus === 'CONFIRMED') {
    if (request.mobileId && (!request.mobile || request.mobile.status !== 'ACTIVE')) {
      throw new AppError('Referenced mobile model is no longer active', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.MOBILE_NOT_AVAILABLE);
    }
    if (request.partId) {
      if (!request.part || request.part.status !== 'ACTIVE') {
        throw new AppError('Referenced spare part is no longer active', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.PART_NOT_AVAILABLE);
      }
      if (request.part.quantity < request.quantity) {
        throw new AppError('Insufficient stock available for spare part', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INSUFFICIENT_STOCK);
      }
    }
  }

  const updateData = { status: newStatus };

  if (adminNotes !== null && adminNotes !== undefined) {
    updateData.adminNotes = adminNotes.trim();
  }

  if (newStatus === 'COMPLETED') {
    if (adminId) {
      updateData.processedBy = adminId;
    }
    updateData.processedAt = new Date();
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: updateData,
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true, status: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true, quantity: true, status: true } },
    },
  });

  return formatRequest(updated, true);
};

module.exports = {
  createRequest,
  getCustomerRequests,
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

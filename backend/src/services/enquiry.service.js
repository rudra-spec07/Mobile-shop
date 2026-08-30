const { prisma } = require('../config/database');
const { parsePagination } = require('../utils/pagination');
const AppError = require('../middleware/error.middleware').AppError;
const { HTTP_STATUS, ERROR_CODES, ROLES } = require('../utils/constants');

/**
 * Helper to format Enquiry response payload.
 */
const formatEnquiry = (enquiry) => {
  return {
    id: enquiry.id,
    customerId: enquiry.customerId,
    customer: enquiry.customer
      ? {
          id: enquiry.customer.id,
          name: enquiry.customer.name,
          email: enquiry.customer.email,
          mobileNumber: enquiry.customer.mobileNumber,
        }
      : undefined,
    mobileId: enquiry.mobileId,
    mobile: enquiry.mobile
      ? {
          id: enquiry.mobile.id,
          name: enquiry.mobile.name,
          modelNumber: enquiry.mobile.modelNumber,
          price: enquiry.mobile.price,
          sellingPrice: enquiry.mobile.sellingPrice,
        }
      : undefined,
    partId: enquiry.partId,
    part: enquiry.part
      ? {
          id: enquiry.part.id,
          name: enquiry.part.name,
          partNumber: enquiry.part.partNumber,
          price: enquiry.part.price,
        }
      : undefined,
    subject: enquiry.subject,
    message: enquiry.message,
    status: enquiry.status,
    adminResponse: enquiry.adminResponse,
    respondedAt: enquiry.respondedAt,
    respondedBy: enquiry.respondedBy,
    createdAt: enquiry.createdAt,
    updatedAt: enquiry.updatedAt,
  };
};

/**
 * Customer creates a new enquiry.
 * customerId is strictly derived from authenticated JWT.
 */
const createEnquiry = async (data, customerId) => {
  const { subject, message, mobileId, partId } = data;

  // Validate referenced Mobile if provided
  if (mobileId) {
    const mobile = await prisma.mobile.findUnique({ where: { id: mobileId } });
    if (!mobile) {
      throw new AppError('Referenced mobile model not found', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.MOBILE_NOT_FOUND);
    }
  }

  // Validate referenced Part if provided
  if (partId) {
    const part = await prisma.part.findUnique({ where: { id: partId } });
    if (!part) {
      throw new AppError('Referenced spare part not found', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.PART_NOT_FOUND);
    }
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      customerId,
      subject,
      message,
      mobileId: mobileId || null,
      partId: partId || null,
      status: 'NEW',
    },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true } },
    },
  });

  return formatEnquiry(enquiry);
};

/**
 * Customer fetches their own enquiry list.
 */
const getCustomerEnquiries = async (customerId, query = {}) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where = {
    customerId,
  };

  if (query.status) {
    where.status = query.status;
  }

  const [total, enquiries] = await prisma.$transaction([
    prisma.enquiry.count({ where }),
    prisma.enquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
        mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true } },
        part: { select: { id: true, name: true, partNumber: true, price: true } },
      },
    }),
  ]);

  return {
    enquiries: enquiries.map(formatEnquiry),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get single enquiry details.
 * Customer can ONLY view their own enquiry. Super Admin can view any enquiry.
 */
const getEnquiryById = async (enquiryId, user) => {
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true } },
    },
  });

  if (!enquiry) {
    throw new AppError('Enquiry not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.ENQUIRY_NOT_FOUND);
  }

  // Ownership Check for Customer
  if (user.role !== ROLES.SUPER_ADMIN && enquiry.customerId !== user.userId) {
    throw new AppError('Enquiry not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.ENQUIRY_NOT_FOUND);
  }

  return formatEnquiry(enquiry);
};

/**
 * Customer cancels their own enquiry.
 * Only allowed for NEW or IN_PROGRESS status.
 */
const cancelEnquiry = async (enquiryId, customerId) => {
  const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });

  if (!enquiry) {
    throw new AppError('Enquiry not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.ENQUIRY_NOT_FOUND);
  }

  if (enquiry.customerId !== customerId) {
    throw new AppError('Enquiry not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.ENQUIRY_NOT_FOUND);
  }

  if (enquiry.status === 'RESOLVED') {
    throw new AppError('Cannot cancel a resolved enquiry', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.ENQUIRY_ALREADY_RESOLVED);
  }

  if (enquiry.status === 'CANCELLED') {
    throw new AppError('Enquiry is already cancelled', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.ENQUIRY_ALREADY_CANCELLED);
  }

  if (!['NEW', 'IN_PROGRESS'].includes(enquiry.status)) {
    throw new AppError(`Cannot cancel enquiry in '${enquiry.status}' status`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_STATUS_TRANSITION);
  }

  const updated = await prisma.enquiry.update({
    where: { id: enquiryId },
    data: { status: 'CANCELLED' },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true } },
    },
  });

  return formatEnquiry(updated);
};

/**
 * Super Admin lists all enquiries with search, filtering, sorting, and pagination.
 */
const getAdminEnquiries = async (query = {}) => {
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
      { message: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  // Parse sorting
  let orderBy = { createdAt: 'desc' };
  if (query.sort === 'oldest' || query.sortOrder?.toLowerCase() === 'asc') {
    orderBy = { createdAt: 'asc' };
  }

  const [total, enquiries] = await prisma.$transaction([
    prisma.enquiry.count({ where }),
    prisma.enquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
        mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true } },
        part: { select: { id: true, name: true, partNumber: true, price: true } },
      },
    }),
  ]);

  return {
    enquiries: enquiries.map(formatEnquiry),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Super Admin submits a response to an enquiry.
 */
const respondToEnquiry = async (enquiryId, responseText, adminId) => {
  const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });

  if (!enquiry) {
    throw new AppError('Enquiry not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.ENQUIRY_NOT_FOUND);
  }

  if (enquiry.status === 'RESOLVED') {
    throw new AppError('Cannot respond to a resolved enquiry', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.ENQUIRY_ALREADY_RESOLVED);
  }

  if (enquiry.status === 'CANCELLED') {
    throw new AppError('Cannot respond to a cancelled enquiry', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.ENQUIRY_ALREADY_CANCELLED);
  }

  const updated = await prisma.enquiry.update({
    where: { id: enquiryId },
    data: {
      adminResponse: responseText.trim(),
      respondedBy: adminId,
      respondedAt: new Date(),
      status: 'RESPONDED',
    },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true } },
    },
  });

  return formatEnquiry(updated);
};

/**
 * Super Admin updates enquiry status with strict lifecycle transition rules.
 */
const updateEnquiryStatus = async (enquiryId, newStatus) => {
  const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });

  if (!enquiry) {
    throw new AppError('Enquiry not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.ENQUIRY_NOT_FOUND);
  }

  const currentStatus = enquiry.status;

  if (currentStatus === newStatus) {
    return formatEnquiry(enquiry);
  }

  // Finalized states check
  if (currentStatus === 'RESOLVED') {
    throw new AppError('Cannot modify status of a resolved enquiry', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.ENQUIRY_ALREADY_RESOLVED);
  }

  if (currentStatus === 'CANCELLED') {
    throw new AppError('Cannot modify status of a cancelled enquiry', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.ENQUIRY_ALREADY_CANCELLED);
  }

  // Transition validation map
  const allowedTransitions = {
    NEW: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['RESPONDED', 'CANCELLED'],
    RESPONDED: ['RESOLVED', 'IN_PROGRESS'],
  };

  const validNextStates = allowedTransitions[currentStatus] || [];
  if (!validNextStates.includes(newStatus)) {
    throw new AppError(
      `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_STATUS_TRANSITION
    );
  }

  const updated = await prisma.enquiry.update({
    where: { id: enquiryId },
    data: { status: newStatus },
    include: {
      customer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      mobile: { select: { id: true, name: true, modelNumber: true, price: true, sellingPrice: true } },
      part: { select: { id: true, name: true, partNumber: true, price: true } },
    },
  });

  return formatEnquiry(updated);
};

module.exports = {
  createEnquiry,
  getCustomerEnquiries,
  getEnquiryById,
  cancelEnquiry,
  getAdminEnquiries,
  respondToEnquiry,
  updateEnquiryStatus,
};

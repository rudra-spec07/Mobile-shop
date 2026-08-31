const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ROLES } = require('../utils/constants');

/**
 * Super Admin Dashboard Service
 * Aggregates statistics and metrics across Users, Mobiles, Parts, Enquiries, and Service Requests.
 */

/**
 * Get comprehensive dashboard statistics
 */
const getDashboardStatistics = async () => {
  const [
    // Customer Metrics
    totalCustomers,
    activeCustomers,
    inactiveCustomers,

    // Mobile Metrics
    totalMobiles,
    activeMobiles,
    featuredMobiles,
    outOfStockMobiles,

    // Part Metrics
    totalParts,
    activeParts,
    outOfStockPartsCount,
    allActiveParts,

    // Enquiry Metrics
    totalEnquiries,
    newEnquiries,
    inProgressEnquiries,
    respondedEnquiries,
    resolvedEnquiries,

    // Service Request Metrics
    totalRequests,
    pendingRequests,
    confirmedRequests,
    processingRequests,
    completedRequests,
    cancelledRequests,
  ] = await Promise.all([
    // Customers
    prisma.user.count({ where: { role: ROLES.CUSTOMER } }),
    prisma.user.count({ where: { role: ROLES.CUSTOMER, isActive: true } }),
    prisma.user.count({ where: { role: ROLES.CUSTOMER, isActive: false } }),

    // Mobiles
    prisma.mobile.count(),
    prisma.mobile.count({ where: { status: 'ACTIVE' } }),
    prisma.mobile.count({ where: { featured: true } }),
    prisma.mobile.count({ where: { status: 'OUT_OF_STOCK' } }),

    // Parts
    prisma.part.count(),
    prisma.part.count({ where: { status: 'ACTIVE' } }),
    prisma.part.count({ where: { quantity: 0 } }),
    prisma.part.findMany({
      where: { status: 'ACTIVE' },
      select: { quantity: true, minimumStock: true },
    }),

    // Enquiries
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: 'NEW' } }),
    prisma.enquiry.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.enquiry.count({ where: { status: 'RESPONDED' } }),
    prisma.enquiry.count({ where: { status: 'RESOLVED' } }),

    // Service Requests
    prisma.serviceRequest.count(),
    prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
    prisma.serviceRequest.count({ where: { status: 'CONFIRMED' } }),
    prisma.serviceRequest.count({ where: { status: 'PROCESSING' } }),
    prisma.serviceRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.serviceRequest.count({ where: { status: 'CANCELLED' } }),
  ]);

  // Calculate low stock parts (ACTIVE parts where 0 < quantity <= minimumStock)
  const lowStockPartsCount = allActiveParts.filter(
    (p) => p.quantity > 0 && p.quantity <= p.minimumStock
  ).length;

  return {
    customers: {
      total: totalCustomers,
      active: activeCustomers,
      inactive: inactiveCustomers,
    },
    mobiles: {
      total: totalMobiles,
      active: activeMobiles,
      featured: featuredMobiles,
      outOfStock: outOfStockMobiles,
    },
    parts: {
      total: totalParts,
      active: activeParts,
      lowStock: lowStockPartsCount,
      outOfStock: outOfStockPartsCount,
    },
    enquiries: {
      total: totalEnquiries,
      new: newEnquiries,
      inProgress: inProgressEnquiries,
      responded: respondedEnquiries,
      resolved: resolvedEnquiries,
    },
    requests: {
      total: totalRequests,
      pending: pendingRequests,
      confirmed: confirmedRequests,
      processing: processingRequests,
      completed: completedRequests,
      cancelled: cancelledRequests,
    },
  };
};

/**
 * Get recent enquiries for dashboard widget
 */
const getRecentEnquiries = async (limit = 5) => {
  const take = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);

  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      subject: true,
      status: true,
      createdAt: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return enquiries.map((item) => ({
    id: item.id,
    subject: item.subject,
    status: item.status,
    createdAt: item.createdAt,
    customerName: item.customer?.name || 'Unknown',
    customerEmail: item.customer?.email || '',
  }));
};

/**
 * Get recent service requests for dashboard widget
 */
const getRecentRequests = async (limit = 5) => {
  const take = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);

  const requests = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      subject: true,
      quantity: true,
      price: true,
      status: true,
      cancellationRequested: true,
      createdAt: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      mobile: {
        select: {
          id: true,
          name: true,
        },
      },
      part: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return requests.map((item) => ({
    id: item.id,
    itemName: item.mobile?.name || item.part?.name || item.subject || 'Service Request',
    quantity: item.quantity,
    price: item.price ? Number(item.price) : 0,
    status: item.status,
    cancellationRequested: item.cancellationRequested,
    createdAt: item.createdAt,
    customerName: item.customer?.name || 'Unknown',
    customerEmail: item.customer?.email || '',
  }));
};

/**
 * Get attention/alert items requiring admin action
 */
const getAttentionItems = async () => {
  const [newEnquiriesCount, pendingRequestsCount, outOfStockPartsCount, allActiveParts] =
    await Promise.all([
      prisma.enquiry.count({ where: { status: 'NEW' } }),
      prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
      prisma.part.count({ where: { quantity: 0 } }),
      prisma.part.findMany({
        where: { status: 'ACTIVE' },
        select: { quantity: true, minimumStock: true },
      }),
    ]);

  const lowStockPartsCount = allActiveParts.filter(
    (p) => p.quantity > 0 && p.quantity <= p.minimumStock
  ).length;

  return {
    newEnquiries: newEnquiriesCount,
    pendingRequests: pendingRequestsCount,
    lowStockParts: lowStockPartsCount,
    outOfStockParts: outOfStockPartsCount,
  };
};

module.exports = {
  getDashboardStatistics,
  getRecentEnquiries,
  getRecentRequests,
  getAttentionItems,
};

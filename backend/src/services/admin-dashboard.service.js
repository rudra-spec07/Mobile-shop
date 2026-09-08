const { prisma } = require('../config/database');
const { ROLES } = require('../utils/constants');

/**
 * Super Admin Dashboard Service
 * Aggregates statistics and metrics across Users, Mobiles, Parts, Enquiries, and Service Requests.
 */

/**
 * Helper to get low stock parts count at database level
 */
const getLowStockCount = async () => {
  try {
    const res = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count 
      FROM parts 
      WHERE status = 'ACTIVE' AND quantity > 0 AND quantity <= "minimumStock"
    `;
    return res[0]?.count || 0;
  } catch (err) {
    const activeParts = await prisma.part.findMany({
      where: { status: 'ACTIVE' },
      select: { quantity: true, minimumStock: true },
    });
    return activeParts.filter((p) => p.quantity > 0 && p.quantity <= p.minimumStock).length;
  }
};

/**
 * Get comprehensive dashboard statistics
 */
const getDashboardStatistics = async () => {
  const [
    userGroup,
    mobileGroup,
    featuredMobileCount,
    partTotal,
    partActive,
    partOutOfStock,
    lowStockCount,
    enquiryGroup,
    requestGroup,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ['isActive'],
      where: { role: ROLES.CUSTOMER },
      _count: true,
    }),
    prisma.mobile.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.mobile.count({ where: { featured: true } }),
    prisma.part.count(),
    prisma.part.count({ where: { status: 'ACTIVE' } }),
    prisma.part.count({ where: { quantity: 0 } }),
    getLowStockCount(),
    prisma.enquiry.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.serviceRequest.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  // Aggregate customer metrics
  let activeCustomers = 0;
  let inactiveCustomers = 0;
  userGroup.forEach((g) => {
    if (g.isActive) activeCustomers += g._count;
    else inactiveCustomers += g._count;
  });
  const totalCustomers = activeCustomers + inactiveCustomers;

  // Aggregate mobile metrics
  let activeMobiles = 0;
  let outOfStockMobiles = 0;
  let totalMobiles = 0;
  mobileGroup.forEach((g) => {
    totalMobiles += g._count;
    if (g.status === 'ACTIVE') activeMobiles = g._count;
    if (g.status === 'OUT_OF_STOCK') outOfStockMobiles = g._count;
  });

  // Aggregate enquiry metrics
  const enquiryCounts = { NEW: 0, IN_PROGRESS: 0, RESPONDED: 0, RESOLVED: 0 };
  let totalEnquiries = 0;
  enquiryGroup.forEach((g) => {
    totalEnquiries += g._count;
    if (enquiryCounts[g.status] !== undefined) {
      enquiryCounts[g.status] = g._count;
    }
  });

  // Aggregate service request metrics
  const requestCounts = { PENDING: 0, CONFIRMED: 0, PROCESSING: 0, COMPLETED: 0, CANCELLED: 0 };
  let totalRequests = 0;
  requestGroup.forEach((g) => {
    totalRequests += g._count;
    if (requestCounts[g.status] !== undefined) {
      requestCounts[g.status] = g._count;
    }
  });

  return {
    customers: {
      total: totalCustomers,
      active: activeCustomers,
      inactive: inactiveCustomers,
    },
    mobiles: {
      total: totalMobiles,
      active: activeMobiles,
      featured: featuredMobileCount,
      outOfStock: outOfStockMobiles,
    },
    parts: {
      total: partTotal,
      active: partActive,
      lowStock: lowStockCount,
      outOfStock: partOutOfStock,
    },
    enquiries: {
      total: totalEnquiries,
      new: enquiryCounts.NEW,
      inProgress: enquiryCounts.IN_PROGRESS,
      responded: enquiryCounts.RESPONDED,
      resolved: enquiryCounts.RESOLVED,
    },
    requests: {
      total: totalRequests,
      pending: requestCounts.PENDING,
      confirmed: requestCounts.CONFIRMED,
      processing: requestCounts.PROCESSING,
      completed: requestCounts.COMPLETED,
      cancelled: requestCounts.CANCELLED,
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
  const [newEnquiriesCount, pendingRequestsCount, outOfStockPartsCount, lowStockPartsCount] =
    await Promise.all([
      prisma.enquiry.count({ where: { status: 'NEW' } }),
      prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
      prisma.part.count({ where: { quantity: 0 } }),
      getLowStockCount(),
    ]);

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

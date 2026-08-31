const { prisma } = require('../config/database');
const { generateSlug } = require('../utils/slug');
const { parsePagination } = require('../utils/pagination');
const AppError = require('../middleware/error.middleware').AppError;
const { HTTP_STATUS, ERROR_CODES, ROLES } = require('../utils/constants');

/**
 * Create a new mobile listing (Super Admin only).
 */
const createMobile = async (data) => {
  const {
    brandId,
    name,
    modelNumber,
    description,
    price,
    sellingPrice,
    ram,
    storage,
    processor,
    display,
    frontCamera,
    rearCamera,
    battery,
    operatingSystem,
    network,
    simType,
    color,
    featured = false,
  } = data;

  // Validate Brand existence and active status
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) {
    throw new AppError('Brand not found', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_BRAND);
  }
  if (brand.status !== 'ACTIVE') {
    throw new AppError('Cannot create mobile listing for an inactive brand', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BRAND_INACTIVE);
  }

  // Validate Pricing
  const numericPrice = Number(price);
  const numericSellingPrice = sellingPrice !== undefined && sellingPrice !== null ? Number(sellingPrice) : null;

  if (numericPrice <= 0) {
    throw new AppError('Mobile regular price must be greater than 0', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_MOBILE_PRICE);
  }
  if (numericSellingPrice !== null && (numericSellingPrice <= 0 || numericSellingPrice > numericPrice)) {
    throw new AppError('Selling price must be greater than 0 and less than or equal to regular price', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_MOBILE_PRICE);
  }

  // Generate Unique Slug
  let slug = generateSlug(name);
  const slugExists = await prisma.mobile.findUnique({ where: { slug } });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const mobile = await prisma.mobile.create({
    data: {
      brandId,
      name,
      modelNumber: modelNumber || null,
      slug,
      description: description || null,
      price: numericPrice,
      sellingPrice: numericSellingPrice,
      ram: ram || null,
      storage: storage || null,
      processor: processor || null,
      display: display || null,
      frontCamera: frontCamera || null,
      rearCamera: rearCamera || null,
      battery: battery || null,
      operatingSystem: operatingSystem || null,
      network: network || null,
      simType: simType || null,
      color: color || null,
      status: 'ACTIVE',
      featured: Boolean(featured),
    },
    include: {
      brand: {
        select: { id: true, name: true, slug: true, logoUrl: true, status: true },
      },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      },
    },
  });

  return mobile;
};

/**
 * Get paginated list of mobiles.
 * CUSTOMER: Returns ACTIVE / OUT_OF_STOCK mobiles under ACTIVE brands only.
 * SUPER_ADMIN: Can filter by status, brandId, featured, search and view all records.
 */
const getMobiles = async (query = {}, userRole = ROLES.CUSTOMER) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const search = query.search?.trim();

  const where = {};

  // Role visibility restriction
  if (userRole !== ROLES.SUPER_ADMIN) {
    where.status = { in: ['ACTIVE', 'OUT_OF_STOCK'] };
    where.brand = { status: 'ACTIVE' };
  } else {
    if (query.status) {
      where.status = query.status;
    }
    if (query.brandStatus) {
      where.brand = { status: query.brandStatus };
    }
  }

  // Brand Filter
  if (query.brandId) {
    where.brandId = query.brandId;
  }

  // Featured Filter
  if (query.featured !== undefined) {
    where.featured = query.featured === 'true' || query.featured === true;
  }

  // Specification Filters
  if (query.ram) {
    where.ram = { contains: query.ram.trim(), mode: 'insensitive' };
  }
  if (query.storage) {
    where.storage = { contains: query.storage.trim(), mode: 'insensitive' };
  }
  if (query.operatingSystem) {
    where.operatingSystem = { contains: query.operatingSystem.trim(), mode: 'insensitive' };
  }
  if (query.network) {
    where.network = { contains: query.network.trim(), mode: 'insensitive' };
  }
  if (query.simType) {
    where.simType = { contains: query.simType.trim(), mode: 'insensitive' };
  }
  if (query.color) {
    where.color = { contains: query.color.trim(), mode: 'insensitive' };
  }

  // Price Range Filter
  const minP = query.minPrice !== undefined ? Number(query.minPrice) : undefined;
  const maxP = query.maxPrice !== undefined ? Number(query.maxPrice) : undefined;

  if (!isNaN(minP) || !isNaN(maxP)) {
    const priceFilter = {};
    if (!isNaN(minP) && minP >= 0) priceFilter.gte = minP;
    if (!isNaN(maxP) && maxP >= 0) priceFilter.lte = maxP;
    where.price = priceFilter;
  }

  // Multi-field Search
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { modelNumber: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { processor: { contains: search, mode: 'insensitive' } },
      { ram: { contains: search, mode: 'insensitive' } },
      { storage: { contains: search, mode: 'insensitive' } },
      { operatingSystem: { contains: search, mode: 'insensitive' } },
      { brand: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  // Parse Sorting
  let orderBy = { createdAt: 'desc' };
  const sortParam = query.sort?.toLowerCase();
  const sortByParam = query.sortBy?.toLowerCase();
  const sortOrderParam = query.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  if (sortParam) {
    switch (sortParam) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'newest':
      case 'createdat_desc':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
      case 'createdat_asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'featured':
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
  } else if (sortByParam) {
    if (sortByParam === 'price') {
      orderBy = { price: sortOrderParam };
    } else if (sortByParam === 'name') {
      orderBy = { name: sortOrderParam };
    } else if (sortByParam === 'createdat') {
      orderBy = { createdAt: sortOrderParam };
    }
  }

  const [total, mobiles] = await prisma.$transaction([
    prisma.mobile.count({ where }),
    prisma.mobile.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        brand: {
          select: { id: true, name: true, slug: true, logoUrl: true, status: true },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
      },
    }),
  ]);

  return {
    mobiles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get featured mobiles for catalog.
 */
const getFeaturedMobiles = async (query = {}, userRole = ROLES.CUSTOMER) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where = {
    featured: true,
  };

  if (userRole !== ROLES.SUPER_ADMIN) {
    where.status = { in: ['ACTIVE', 'OUT_OF_STOCK'] };
    where.brand = { status: 'ACTIVE' };
  }

  const [total, mobiles] = await prisma.$transaction([
    prisma.mobile.count({ where }),
    prisma.mobile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        brand: {
          select: { id: true, name: true, slug: true, logoUrl: true, status: true },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
      },
    }),
  ]);

  return {
    mobiles,
    pagination: {
      page,
      limit,
      total,
    },
  };
};

/**
 * Get mobile model details by ID.
 */
const getMobileById = async (id, userRole = ROLES.CUSTOMER) => {
  const mobile = await prisma.mobile.findUnique({
    where: { id },
    include: {
      brand: {
        select: { id: true, name: true, slug: true, logoUrl: true, status: true },
      },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      },
    },
  });

  if (!mobile) {
    throw new AppError('Mobile model not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.MOBILE_NOT_FOUND);
  }

  if (userRole !== ROLES.SUPER_ADMIN) {
    if (mobile.status === 'INACTIVE' || mobile.brand.status !== 'ACTIVE') {
      throw new AppError('Mobile model not found or unavailable', HTTP_STATUS.NOT_FOUND, ERROR_CODES.MOBILE_NOT_FOUND);
    }
  }

  return mobile;
};

/**
 * Update mobile details (Super Admin only).
 */
const updateMobile = async (id, data) => {
  const mobile = await prisma.mobile.findUnique({ where: { id } });

  if (!mobile) {
    throw new AppError('Mobile model not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.MOBILE_NOT_FOUND);
  }

  const updateData = {};

  // Brand update check
  if (data.brandId && data.brandId !== mobile.brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });
    if (!brand) {
      throw new AppError('Brand not found', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_BRAND);
    }
    if (brand.status !== 'ACTIVE') {
      throw new AppError('Cannot reassign mobile to an inactive brand', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BRAND_INACTIVE);
    }
    updateData.brandId = data.brandId;
  }

  // Price validation
  const currentPrice = data.price !== undefined ? Number(data.price) : Number(mobile.price);
  const currentSellingPrice = data.sellingPrice !== undefined ? (data.sellingPrice !== null ? Number(data.sellingPrice) : null) : (mobile.sellingPrice !== null ? Number(mobile.sellingPrice) : null);

  if (currentPrice <= 0) {
    throw new AppError('Regular price must be greater than 0', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_MOBILE_PRICE);
  }
  if (currentSellingPrice !== null && (currentSellingPrice <= 0 || currentSellingPrice > currentPrice)) {
    throw new AppError('Selling price must be greater than 0 and less than or equal to regular price', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_MOBILE_PRICE);
  }

  if (data.price !== undefined) updateData.price = currentPrice;
  if (data.sellingPrice !== undefined) updateData.sellingPrice = currentSellingPrice;

  // Name & Slug update
  if (data.name && data.name.trim() !== mobile.name) {
    updateData.name = data.name.trim();
    let newSlug = generateSlug(data.name.trim());
    const slugExists = await prisma.mobile.findFirst({
      where: { slug: newSlug, NOT: { id } },
    });
    if (slugExists) {
      newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
    }
    updateData.slug = newSlug;
  }

  // Direct String & Specification Fields
  const allowedFields = [
    'modelNumber', 'description', 'ram', 'storage', 'processor',
    'display', 'frontCamera', 'rearCamera', 'battery', 'operatingSystem',
    'network', 'simType', 'color', 'status', 'featured'
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  const updatedMobile = await prisma.mobile.update({
    where: { id },
    data: updateData,
    include: {
      brand: {
        select: { id: true, name: true, slug: true, logoUrl: true, status: true },
      },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      },
    },
  });

  const { createAuditLog } = require('./audit.service');
  createAuditLog({
    action: 'MOBILE_UPDATE',
    entityType: 'Mobile',
    entityId: id,
    oldValue: { name: mobile.name, price: Number(mobile.price), status: mobile.status },
    newValue: { name: updatedMobile.name, price: Number(updatedMobile.price), status: updatedMobile.status },
  });

  return updatedMobile;
};

/**
 * Update mobile status (Super Admin only).
 */
const updateMobileStatus = async (id, status) => {
  const mobile = await prisma.mobile.findUnique({ where: { id } });

  if (!mobile) {
    throw new AppError('Mobile model not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.MOBILE_NOT_FOUND);
  }

  const updatedMobile = await prisma.mobile.update({
    where: { id },
    data: { status },
    include: {
      brand: {
        select: { id: true, name: true, slug: true, logoUrl: true, status: true },
      },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      },
    },
  });

  const { createAuditLog } = require('./audit.service');
  createAuditLog({
    action: 'MOBILE_STATUS_CHANGE',
    entityType: 'Mobile',
    entityId: id,
    oldValue: { status: mobile.status },
    newValue: { status: updatedMobile.status },
  });

  return updatedMobile;
};

/**
 * Update mobile featured status (Super Admin only).
 */
const updateFeaturedStatus = async (id, featured) => {
  const mobile = await prisma.mobile.findUnique({ where: { id } });

  if (!mobile) {
    throw new AppError('Mobile model not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.MOBILE_NOT_FOUND);
  }

  const updatedMobile = await prisma.mobile.update({
    where: { id },
    data: { featured: Boolean(featured) },
    include: {
      brand: {
        select: { id: true, name: true, slug: true, logoUrl: true, status: true },
      },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      },
    },
  });

  return updatedMobile;
};

module.exports = {
  createMobile,
  getMobiles,
  getFeaturedMobiles,
  getMobileById,
  updateMobile,
  updateMobileStatus,
  updateFeaturedStatus,
};

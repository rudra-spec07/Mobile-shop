const { prisma } = require('../config/database');
const { generateSlug } = require('../utils/slug');
const { parsePagination } = require('../utils/pagination');
const AppError = require('../middleware/error.middleware').AppError;
const { HTTP_STATUS, ERROR_CODES, ROLES } = require('../utils/constants');

/**
 * Create a new brand (Super Admin only).
 */
const createBrand = async ({ name, logoUrl }) => {
  const existingBrand = await prisma.brand.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
  });

  if (existingBrand) {
    throw new AppError('Brand with this name already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.BRAND_ALREADY_EXISTS);
  }

  let slug = generateSlug(name);
  let slugExists = await prisma.brand.findUnique({ where: { slug } });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const brand = await prisma.brand.create({
    data: {
      name,
      slug,
      logoUrl: logoUrl || null,
      status: 'ACTIVE',
    },
  });

  return brand;
};

/**
 * Get paginated list of brands.
 * CUSTOMER: Returns ACTIVE brands only.
 * SUPER_ADMIN: Can filter by status and view all.
 */
const getBrands = async (query = {}, userRole = ROLES.CUSTOMER) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const search = query.search?.trim();

  const where = {};

  // Role visibility restriction
  if (userRole !== ROLES.SUPER_ADMIN) {
    where.status = 'ACTIVE';
  } else if (query.status) {
    where.status = query.status;
  }

  // Search filter
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [total, brands] = await prisma.$transaction([
    prisma.brand.count({ where }),
    prisma.brand.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { mobiles: true },
        },
      },
    }),
  ]);

  return {
    brands,
    pagination: {
      page,
      limit,
      total,
    },
  };
};

/**
 * Get brand details by ID.
 */
const getBrandById = async (id, userRole = ROLES.CUSTOMER) => {
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      _count: {
        select: { mobiles: true },
      },
    },
  });

  if (!brand) {
    throw new AppError('Brand not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.BRAND_NOT_FOUND);
  }

  if (userRole !== ROLES.SUPER_ADMIN && brand.status !== 'ACTIVE') {
    throw new AppError('Brand not found or inactive', HTTP_STATUS.NOT_FOUND, ERROR_CODES.BRAND_NOT_FOUND);
  }

  return brand;
};

/**
 * Update brand details (Super Admin only).
 */
const updateBrand = async (id, { name, logoUrl }) => {
  const brand = await prisma.brand.findUnique({ where: { id } });

  if (!brand) {
    throw new AppError('Brand not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.BRAND_NOT_FOUND);
  }

  const updateData = {};

  if (logoUrl !== undefined) {
    updateData.logoUrl = logoUrl || null;
  }

  if (name && name.trim().toLowerCase() !== brand.name.toLowerCase()) {
    const existingBrand = await prisma.brand.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        NOT: { id },
      },
    });

    if (existingBrand) {
      throw new AppError('Brand with this name already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.BRAND_ALREADY_EXISTS);
    }

    updateData.name = name.trim();
    let newSlug = generateSlug(name.trim());
    const slugExists = await prisma.brand.findFirst({
      where: { slug: newSlug, NOT: { id } },
    });
    if (slugExists) {
      newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
    }
    updateData.slug = newSlug;
  }

  const updatedBrand = await prisma.brand.update({
    where: { id },
    data: updateData,
  });

  return updatedBrand;
};

/**
 * Update brand status (Super Admin only).
 */
const updateBrandStatus = async (id, status) => {
  const brand = await prisma.brand.findUnique({ where: { id } });

  if (!brand) {
    throw new AppError('Brand not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.BRAND_NOT_FOUND);
  }

  const updatedBrand = await prisma.brand.update({
    where: { id },
    data: { status },
  });

  return updatedBrand;
};

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  updateBrandStatus,
};

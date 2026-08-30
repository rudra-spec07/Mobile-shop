const { prisma } = require('../config/database');
const { AppError } = require('../middleware/error.middleware');
const { HTTP_STATUS, ERROR_CODES, ROLES } = require('../utils/constants');
const { parsePagination } = require('../utils/pagination');

const createCategory = async (data) => {
  const existingCategory = await prisma.partCategory.findUnique({
    where: { name: data.name },
  });

  if (existingCategory) {
    throw new AppError('Part category with this name already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.PART_CATEGORY_ALREADY_EXISTS);
  }

  const category = await prisma.partCategory.create({
    data: {
      name: data.name,
      description: data.description || null,
    },
  });

  return category;
};

const getCategories = async (query = {}, userRole = ROLES.CUSTOMER) => {
  const { page, limit, skip } = parsePagination(query);

  const where = {};

  // Customer can only view ACTIVE categories
  if (userRole !== ROLES.SUPER_ADMIN) {
    where.status = 'ACTIVE';
  } else if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const categories = await prisma.partCategory.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { parts: true },
      },
    },
  });
  const total = await prisma.partCategory.count({ where });

  return {
    categories,
    pagination: { page, limit, total },
  };
};

const getCategoryById = async (id, userRole = ROLES.CUSTOMER) => {
  const category = await prisma.partCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { parts: true },
      },
    },
  });

  if (!category) {
    throw new AppError('Part category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_CATEGORY_NOT_FOUND);
  }

  if (userRole !== ROLES.SUPER_ADMIN && category.status !== 'ACTIVE') {
    throw new AppError('Part category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_CATEGORY_NOT_FOUND);
  }

  return category;
};

const updateCategory = async (id, data) => {
  const category = await prisma.partCategory.findUnique({ where: { id } });
  if (!category) {
    throw new AppError('Part category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_CATEGORY_NOT_FOUND);
  }

  if (data.name && data.name !== category.name) {
    const existingCategory = await prisma.partCategory.findUnique({
      where: { name: data.name },
    });
    if (existingCategory) {
      throw new AppError('Part category with this name already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.PART_CATEGORY_ALREADY_EXISTS);
    }
  }

  const updatedCategory = await prisma.partCategory.update({
    where: { id },
    data: {
      name: data.name !== undefined ? data.name : category.name,
      description: data.description !== undefined ? data.description : category.description,
    },
  });

  return updatedCategory;
};

const updateCategoryStatus = async (id, status) => {
  const category = await prisma.partCategory.findUnique({ where: { id } });
  if (!category) {
    throw new AppError('Part category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_CATEGORY_NOT_FOUND);
  }

  const updatedCategory = await prisma.partCategory.update({
    where: { id },
    data: { status },
  });

  return updatedCategory;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
};

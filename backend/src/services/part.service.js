const { prisma } = require('../config/database');
const { AppError } = require('../middleware/error.middleware');
const { HTTP_STATUS, ERROR_CODES, ROLES } = require('../utils/constants');
const { parsePagination } = require('../utils/pagination');
const { deleteFromCloudinary } = require('./cloudinary.service');

const calculateStockStatus = (quantity, minimumStock) => {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (quantity <= minimumStock) return 'LOW_STOCK';
  return 'IN_STOCK';
};

const formatPartForCustomer = (part) => {
  const stockStatus = calculateStockStatus(part.quantity, part.minimumStock);
  return {
    id: part.id,
    name: part.name,
    partNumber: part.partNumber,
    description: part.description,
    price: part.price,
    inStock: part.quantity > 0,
    stockStatus,
    imageUrl: part.imageUrl,
    category: part.category
      ? {
          id: part.category.id,
          name: part.category.name,
        }
      : null,
    createdAt: part.createdAt,
  };
};

const formatPartForAdmin = (part) => {
  const stockStatus = calculateStockStatus(part.quantity, part.minimumStock);
  return {
    ...part,
    stockStatus,
  };
};

const createPart = async (data, userId) => {
  // Check category
  const category = await prisma.partCategory.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new AppError('Part category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_CATEGORY_NOT_FOUND);
  }

  if (category.status !== 'ACTIVE') {
    throw new AppError('Cannot create part under an inactive category', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.PART_CATEGORY_INACTIVE);
  }

  // Check part number
  const existingPart = await prisma.part.findUnique({
    where: { partNumber: data.partNumber },
  });

  if (existingPart) {
    throw new AppError('Part with this part number already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.PART_NUMBER_ALREADY_EXISTS);
  }

  const initialQuantity = data.quantity || 0;

  // Execute in transaction if initial stock > 0
  const result = await prisma.$transaction(async (tx) => {
    const newPart = await tx.part.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        partNumber: data.partNumber,
        description: data.description || null,
        price: data.price,
        quantity: initialQuantity,
        minimumStock: data.minimumStock || 0,
        imageUrl: data.imageUrl || null,
      },
      include: {
        category: true,
      },
    });

    if (initialQuantity > 0) {
      await tx.inventoryTransaction.create({
        data: {
          partId: newPart.id,
          type: 'STOCK_IN',
          quantity: initialQuantity,
          previousQuantity: 0,
          newQuantity: initialQuantity,
          reason: 'Initial stock on part creation',
          performedBy: userId || 'SYSTEM',
        },
      });
    }

    return newPart;
  });

  return formatPartForAdmin(result);
};

const getParts = async (query = {}, userRole = ROLES.CUSTOMER) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where = {};

  if (userRole !== ROLES.SUPER_ADMIN) {
    where.status = 'ACTIVE';
  } else if (query.status) {
    where.status = query.status;
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
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

  // Multi-field Search (including category name)
  if (query.search) {
    const search = query.search.trim();
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { partNumber: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { name: { contains: search, mode: 'insensitive' } } },
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
      case 'quantity_asc':
        orderBy = { quantity: 'asc' };
        break;
      case 'quantity_desc':
        orderBy = { quantity: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
  } else if (sortByParam) {
    if (sortByParam === 'price') {
      orderBy = { price: sortOrderParam };
    } else if (sortByParam === 'name') {
      orderBy = { name: sortOrderParam };
    } else if (sortByParam === 'quantity') {
      orderBy = { quantity: sortOrderParam };
    } else if (sortByParam === 'createdat') {
      orderBy = { createdAt: sortOrderParam };
    }
  }

  let rawParts = await prisma.part.findMany({
    where,
    skip: query.stockStatus ? undefined : skip,
    take: query.stockStatus ? undefined : limit,
    orderBy,
    include: {
      category: true,
    },
  });

  let formattedParts = rawParts.map((p) => (userRole === ROLES.SUPER_ADMIN ? formatPartForAdmin(p) : formatPartForCustomer(p)));

  // Filter by calculated stockStatus if specified
  if (query.stockStatus === 'LOW_STOCK') {
    formattedParts = formattedParts.filter((p) => p.stockStatus === 'LOW_STOCK');
  } else if (query.stockStatus === 'OUT_OF_STOCK') {
    formattedParts = formattedParts.filter((p) => p.stockStatus === 'OUT_OF_STOCK');
  } else if (query.stockStatus === 'IN_STOCK') {
    formattedParts = formattedParts.filter((p) => p.stockStatus === 'IN_STOCK');
  }

  let total;
  if (query.stockStatus) {
    total = formattedParts.length;
    formattedParts = formattedParts.slice(skip, skip + limit);
  } else {
    total = await prisma.part.count({ where });
  }

  return {
    parts: formattedParts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getPartById = async (id, userRole = ROLES.CUSTOMER) => {
  const part = await prisma.part.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!part) {
    throw new AppError('Part not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_NOT_FOUND);
  }

  if (userRole !== ROLES.SUPER_ADMIN && part.status !== 'ACTIVE') {
    throw new AppError('Part not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_NOT_FOUND);
  }

  return userRole === ROLES.SUPER_ADMIN ? formatPartForAdmin(part) : formatPartForCustomer(part);
};

const updatePart = async (id, data) => {
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) {
    throw new AppError('Part not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_NOT_FOUND);
  }

  if (data.categoryId && data.categoryId !== part.categoryId) {
    const category = await prisma.partCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new AppError('Part category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_CATEGORY_NOT_FOUND);
    }
    if (category.status !== 'ACTIVE') {
      throw new AppError('Cannot assign part to an inactive category', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.PART_CATEGORY_INACTIVE);
    }
  }

  if (data.partNumber && data.partNumber !== part.partNumber) {
    const existingPart = await prisma.part.findUnique({
      where: { partNumber: data.partNumber },
    });
    if (existingPart) {
      throw new AppError('Part with this part number already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.PART_NUMBER_ALREADY_EXISTS);
    }
  }

  // Explicitly construct update data WITHOUT quantity field!
  const updateData = {};
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.partNumber !== undefined) updateData.partNumber = data.partNumber;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.minimumStock !== undefined) updateData.minimumStock = data.minimumStock;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

  const oldImageUrl = part.imageUrl;

  const updatedPart = await prisma.part.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
    },
  });

  if (data.imageUrl !== undefined && oldImageUrl && oldImageUrl !== data.imageUrl) {
    if (oldImageUrl.includes('cloudinary.com')) {
      await deleteFromCloudinary(oldImageUrl).catch(() => {});
    }
  }

  return formatPartForAdmin(updatedPart);
};

const deletePartImage = async (id) => {
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) {
    throw new AppError('Part not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_NOT_FOUND);
  }

  const oldImageUrl = part.imageUrl;

  const updatedPart = await prisma.part.update({
    where: { id },
    data: { imageUrl: null },
    include: { category: true },
  });

  if (oldImageUrl && oldImageUrl.includes('cloudinary.com')) {
    await deleteFromCloudinary(oldImageUrl).catch(() => {});
  }

  return formatPartForAdmin(updatedPart);
};

const updatePartStatus = async (id, status) => {
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) {
    throw new AppError('Part not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.PART_NOT_FOUND);
  }

  const updatedPart = await prisma.part.update({
    where: { id },
    data: { status },
    include: {
      category: true,
    },
  });

  return formatPartForAdmin(updatedPart);
};

module.exports = {
  calculateStockStatus,
  formatPartForCustomer,
  formatPartForAdmin,
  createPart,
  getParts,
  getPartById,
  updatePart,
  deletePartImage,
  updatePartStatus,
};

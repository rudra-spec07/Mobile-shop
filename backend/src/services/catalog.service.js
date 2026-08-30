const { prisma } = require('../config/database');
const { ROLES } = require('../utils/constants');

/**
 * Unified Global Search across Mobiles, Parts, Brands, and PartCategories.
 */
const unifiedSearch = async (queryText = '', userRole = ROLES.CUSTOMER, limitParam = 5) => {
  const search = queryText?.trim();
  const limit = Math.min(50, Math.max(1, parseInt(limitParam, 10) || 5));

  if (!search) {
    return {
      query: '',
      mobiles: [],
      parts: [],
      brands: [],
      categories: [],
    };
  }

  // Role visibility filters
  const mobileWhere = {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { modelNumber: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { processor: { contains: search, mode: 'insensitive' } },
      { ram: { contains: search, mode: 'insensitive' } },
      { storage: { contains: search, mode: 'insensitive' } },
      { brand: { name: { contains: search, mode: 'insensitive' } } },
    ],
  };

  const partWhere = {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { partNumber: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { name: { contains: search, mode: 'insensitive' } } },
    ],
  };

  const brandWhere = {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ],
  };

  const categoryWhere = {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ],
  };

  if (userRole !== ROLES.SUPER_ADMIN) {
    mobileWhere.status = { in: ['ACTIVE', 'OUT_OF_STOCK'] };
    mobileWhere.brand = { status: 'ACTIVE' };

    partWhere.status = 'ACTIVE';
    brandWhere.status = 'ACTIVE';
    categoryWhere.status = 'ACTIVE';
  }

  const [mobiles, parts, brands, categories] = await Promise.all([
    prisma.mobile.findMany({
      where: mobileWhere,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        modelNumber: true,
        slug: true,
        price: true,
        sellingPrice: true,
        status: true,
        brand: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true },
        },
      },
    }),
    prisma.part.findMany({
      where: partWhere,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        partNumber: true,
        price: true,
        quantity: true,
        status: true,
        imageUrl: true,
        category: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.brand.findMany({
      where: brandWhere,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        status: true,
      },
    }),
    prisma.partCategory.findMany({
      where: categoryWhere,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        status: true,
      },
    }),
  ]);

  return {
    query: search,
    mobiles,
    parts,
    brands,
    categories,
  };
};

/**
 * Get dynamic metadata for catalog filters (price min/max, distinct specs, active brands & categories).
 */
const getCatalogFilterMetadata = async (userRole = ROLES.CUSTOMER) => {
  const mobileWhere = userRole !== ROLES.SUPER_ADMIN ? { status: { in: ['ACTIVE', 'OUT_OF_STOCK'] }, brand: { status: 'ACTIVE' } } : {};
  const partWhere = userRole !== ROLES.SUPER_ADMIN ? { status: 'ACTIVE' } : {};
  const brandWhere = userRole !== ROLES.SUPER_ADMIN ? { status: 'ACTIVE' } : {};
  const categoryWhere = userRole !== ROLES.SUPER_ADMIN ? { status: 'ACTIVE' } : {};

  const [
    mobileMinMax,
    partMinMax,
    brands,
    categories,
    ramsRaw,
    storagesRaw,
    systemsRaw,
  ] = await Promise.all([
    prisma.mobile.aggregate({
      where: mobileWhere,
      _min: { price: true, sellingPrice: true },
      _max: { price: true, sellingPrice: true },
    }),
    prisma.part.aggregate({
      where: partWhere,
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.brand.findMany({
      where: brandWhere,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, logoUrl: true },
    }),
    prisma.partCategory.findMany({
      where: categoryWhere,
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.mobile.findMany({
      where: { ...mobileWhere, ram: { not: null } },
      select: { ram: true },
      distinct: ['ram'],
    }),
    prisma.mobile.findMany({
      where: { ...mobileWhere, storage: { not: null } },
      select: { storage: true },
      distinct: ['storage'],
    }),
    prisma.mobile.findMany({
      where: { ...mobileWhere, operatingSystem: { not: null } },
      select: { operatingSystem: true },
      distinct: ['operatingSystem'],
    }),
  ]);

  const mobileMinPrice = Number(mobileMinMax._min?.sellingPrice || mobileMinMax._min?.price || 0);
  const mobileMaxPrice = Number(mobileMinMax._max?.price || mobileMinMax._max?.sellingPrice || 0);

  const partMinPrice = Number(partMinMax._min?.price || 0);
  const partMaxPrice = Number(partMinMax._max?.price || 0);

  const rams = [...new Set(ramsRaw.map((r) => r.ram).filter(Boolean))];
  const storages = [...new Set(storagesRaw.map((s) => s.storage).filter(Boolean))];
  const operatingSystems = [...new Set(systemsRaw.map((o) => o.operatingSystem).filter(Boolean))];

  return {
    mobiles: {
      priceRange: { min: mobileMinPrice, max: mobileMaxPrice },
      brands,
      rams,
      storages,
      operatingSystems,
    },
    parts: {
      priceRange: { min: partMinPrice, max: partMaxPrice },
      categories,
    },
  };
};

module.exports = {
  unifiedSearch,
  getCatalogFilterMetadata,
};

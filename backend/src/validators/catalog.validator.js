const { z } = require('zod');

// Brand Validators
const createBrandSchema = z.object({
  name: z.string().trim().min(2, { message: 'Brand name must be at least 2 characters long' }),
  logoUrl: z.string().trim().url({ message: 'Invalid logo URL format' }).optional().nullable().or(z.literal('')),
});

const updateBrandSchema = z.object({
  name: z.string().trim().min(2, { message: 'Brand name must be at least 2 characters long' }).optional(),
  logoUrl: z.string().trim().url({ message: 'Invalid logo URL format' }).optional().nullable().or(z.literal('')),
});

const updateBrandStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'], { message: 'Status must be ACTIVE or INACTIVE' }),
});

// Mobile Validators
const createMobileSchema = z.object({
  brandId: z.string().uuid({ message: 'Valid brand ID is required' }),
  name: z.string().trim().min(2, { message: 'Mobile name must be at least 2 characters long' }),
  modelNumber: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive({ message: 'Price must be a positive number greater than 0' }),
  sellingPrice: z.coerce.number().positive({ message: 'Selling price must be a positive number greater than 0' }).optional().nullable(),
  ram: z.string().trim().optional().nullable(),
  storage: z.string().trim().optional().nullable(),
  processor: z.string().trim().optional().nullable(),
  display: z.string().trim().optional().nullable(),
  frontCamera: z.string().trim().optional().nullable(),
  rearCamera: z.string().trim().optional().nullable(),
  battery: z.string().trim().optional().nullable(),
  operatingSystem: z.string().trim().optional().nullable(),
  network: z.string().trim().optional().nullable(),
  simType: z.string().trim().optional().nullable(),
  color: z.string().trim().optional().nullable(),
  featured: z.boolean().optional(),
}).refine((data) => {
  if (data.sellingPrice !== undefined && data.sellingPrice !== null) {
    return data.sellingPrice <= data.price;
  }
  return true;
}, {
  message: 'Selling price cannot be greater than regular price',
  path: ['sellingPrice'],
});

const updateMobileSchema = z.object({
  brandId: z.string().uuid({ message: 'Valid brand ID is required' }).optional(),
  name: z.string().trim().min(2, { message: 'Mobile name must be at least 2 characters long' }).optional(),
  modelNumber: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive({ message: 'Price must be a positive number greater than 0' }).optional(),
  sellingPrice: z.coerce.number().positive({ message: 'Selling price must be a positive number greater than 0' }).optional().nullable(),
  ram: z.string().trim().optional().nullable(),
  storage: z.string().trim().optional().nullable(),
  processor: z.string().trim().optional().nullable(),
  display: z.string().trim().optional().nullable(),
  frontCamera: z.string().trim().optional().nullable(),
  rearCamera: z.string().trim().optional().nullable(),
  battery: z.string().trim().optional().nullable(),
  operatingSystem: z.string().trim().optional().nullable(),
  network: z.string().trim().optional().nullable(),
  simType: z.string().trim().optional().nullable(),
  color: z.string().trim().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
  featured: z.boolean().optional(),
}).refine((data) => {
  if (data.price !== undefined && data.sellingPrice !== undefined && data.sellingPrice !== null) {
    return data.sellingPrice <= data.price;
  }
  return true;
}, {
  message: 'Selling price cannot be greater than regular price',
  path: ['sellingPrice'],
});

const updateMobileStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'], { message: 'Status must be ACTIVE, INACTIVE, or OUT_OF_STOCK' }),
});

const updateFeaturedSchema = z.object({
  featured: z.boolean({ message: 'Featured must be a boolean value' }),
});

// Image Validators
const addImageSchema = z.object({
  imageUrl: z.string().trim().min(1, { message: 'Image URL is required' }),
  isPrimary: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

module.exports = {
  createBrandSchema,
  updateBrandSchema,
  updateBrandStatusSchema,
  createMobileSchema,
  updateMobileSchema,
  updateMobileStatusSchema,
  updateFeaturedSchema,
  addImageSchema,
};

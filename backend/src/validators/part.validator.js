const { z } = require('zod');

// Category Schemas
const createPartCategorySchema = z.object({
  name: z.string({ required_error: 'Category name is required' }).min(1, 'Category name cannot be empty').trim(),
  description: z.string().optional(),
});

const updatePartCategorySchema = z.object({
  name: z.string().min(1, 'Category name cannot be empty').trim().optional(),
  description: z.string().optional().nullable(),
});

const updatePartCategoryStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    errorMap: () => ({ message: 'Status must be ACTIVE or INACTIVE' }),
  }),
});

// Part Schemas
const createPartSchema = z.object({
  categoryId: z.string({ required_error: 'Category ID is required' }).uuid('Invalid Category ID format'),
  name: z.string({ required_error: 'Part name is required' }).min(1, 'Part name cannot be empty').trim(),
  partNumber: z.string({ required_error: 'Part number is required' }).min(1, 'Part number cannot be empty').trim(),
  price: z.coerce.number({ required_error: 'Price is required' }).min(0, 'Price must be greater than or equal to 0'),
  quantity: z.coerce.number().int('Quantity must be an integer').min(0, 'Quantity cannot be negative').optional().default(0),
  minimumStock: z.coerce.number().int('Minimum stock must be an integer').min(0, 'Minimum stock cannot be negative').optional().default(0),
  imageUrl: z.string().url('Invalid image URL format').optional().nullable().or(z.literal('')),
});

const updatePartSchema = z.object({
  categoryId: z.string().uuid('Invalid Category ID format').optional(),
  name: z.string().min(1, 'Part name cannot be empty').trim().optional(),
  partNumber: z.string().min(1, 'Part number cannot be empty').trim().optional(),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'Price must be greater than or equal to 0').optional(),
  minimumStock: z.number().int('Minimum stock must be an integer').min(0, 'Minimum stock cannot be negative').optional(),
  imageUrl: z.string().url('Invalid image URL format').optional().nullable(),
});

const updatePartStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    errorMap: () => ({ message: 'Status must be ACTIVE or INACTIVE' }),
  }),
});

// Stock Operations Schemas
const stockInSchema = z.object({
  quantity: z.number({ required_error: 'Stock-in quantity is required' }).int('Quantity must be an integer').gt(0, 'Stock-in quantity must be greater than 0'),
});

const stockOutSchema = z.object({
  quantity: z.number({ required_error: 'Stock-out quantity is required' }).int('Quantity must be an integer').gt(0, 'Stock-out quantity must be greater than 0'),
});

const stockAdjustmentSchema = z.object({
  newQuantity: z.number({ required_error: 'New quantity is required' }).int('New quantity must be an integer').min(0, 'New quantity cannot be negative'),
  reason: z.string({ required_error: 'Reason for adjustment is required' }).min(1, 'Reason cannot be empty').trim(),
});

module.exports = {
  createPartCategorySchema,
  updatePartCategorySchema,
  updatePartCategoryStatusSchema,
  createPartSchema,
  updatePartSchema,
  updatePartStatusSchema,
  stockInSchema,
  stockOutSchema,
  stockAdjustmentSchema,
};

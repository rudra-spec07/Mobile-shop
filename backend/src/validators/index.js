const { z } = require('zod');

// Standard Pagination Query Validation Schema
const paginationQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
});

// UUID / ID Parameter Validation Schema
const idParamSchema = z.object({
  id: z.string().min(1, { message: 'ID parameter is required' }),
});

module.exports = {
  paginationQuerySchema,
  idParamSchema,
};

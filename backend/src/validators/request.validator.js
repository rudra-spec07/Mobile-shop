const { z } = require('zod');

const createRequestSchema = z
  .object({
    mobileId: z.string().uuid({ message: 'Invalid mobile ID format' }).optional().nullable(),
    partId: z.string().uuid({ message: 'Invalid part ID format' }).optional().nullable(),
    quantity: z.coerce
      .number({ required_error: 'Quantity is required' })
      .int({ message: 'Quantity must be an integer' })
      .min(1, { message: 'Quantity must be greater than or equal to 1' }),
    subject: z.string().trim().max(150, { message: 'Subject cannot exceed 150 characters' }).optional().nullable(),
    notes: z.string().trim().max(2000, { message: 'Notes cannot exceed 2000 characters' }).optional().nullable(),
  })
  .refine(
    (data) => {
      const hasMobile = Boolean(data.mobileId);
      const hasPart = Boolean(data.partId);
      return (hasMobile && !hasPart) || (!hasMobile && hasPart);
    },
    {
      message: 'Request must specify either a mobileId or a partId, but not both',
      path: ['mobileId'],
    }
  );

const updateRequestStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'], {
    message: 'Status must be one of PENDING, CONFIRMED, PROCESSING, COMPLETED, or CANCELLED',
  }),
});

const adminCancelSchema = z.object({
  reason: z.string().trim().max(1000, { message: 'Reason cannot exceed 1000 characters' }).optional().nullable(),
});

const requestQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().trim().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED']).optional(),
  mobileId: z.string().uuid().optional(),
  partId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  sort: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
});

module.exports = {
  createRequestSchema,
  updateRequestStatusSchema,
  adminCancelSchema,
  requestQuerySchema,
};

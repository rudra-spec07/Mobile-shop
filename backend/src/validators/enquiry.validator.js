const { z } = require('zod');

const createEnquirySchema = z.object({
  subject: z
    .string({ required_error: 'Enquiry subject is required' })
    .trim()
    .min(3, { message: 'Subject must be at least 3 characters long' })
    .max(150, { message: 'Subject cannot exceed 150 characters' }),
  message: z
    .string({ required_error: 'Enquiry message is required' })
    .trim()
    .min(5, { message: 'Message must be at least 5 characters long' })
    .max(2000, { message: 'Message cannot exceed 2000 characters' }),
  mobileId: z.string().uuid({ message: 'Invalid mobile ID format' }).optional().nullable(),
  partId: z.string().uuid({ message: 'Invalid part ID format' }).optional().nullable(),
});

const adminResponseSchema = z.object({
  response: z
    .string({ required_error: 'Admin response is required' })
    .trim()
    .min(2, { message: 'Response must be at least 2 characters long' })
    .max(2000, { message: 'Response cannot exceed 2000 characters' }),
});

const updateEnquiryStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESPONDED', 'RESOLVED', 'CANCELLED'], {
    message: 'Status must be one of NEW, IN_PROGRESS, RESPONDED, RESOLVED, or CANCELLED',
  }),
});

const enquiryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().trim().optional(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESPONDED', 'RESOLVED', 'CANCELLED']).optional(),
  mobileId: z.string().uuid().optional(),
  partId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  sort: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
});

module.exports = {
  createEnquirySchema,
  adminResponseSchema,
  updateEnquiryStatusSchema,
  enquiryQuerySchema,
};

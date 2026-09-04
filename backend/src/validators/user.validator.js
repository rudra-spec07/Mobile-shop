const { z } = require('zod');

const forgotPasswordSchema = z
  .object({
    identifier: z.string().optional(),
    email: z.string().optional(),
  })
  .refine(
    (data) => {
      const val = (data.identifier || data.email || '').trim();
      if (!val) return false;
      if (val.includes('@')) {
        return z.string().email().safeParse(val).success;
      }
      const cleanPhone = val.replace(/[\s-]/g, '');
      return /^[0-9+]{7,15}$/.test(cleanPhone);
    },
    {
      message: 'Please enter a valid email address or mobile number',
      path: ['identifier'],
    }
  );

const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters long' }),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters long' }),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }).optional(),
  mobileNumber: z
    .string()
    .regex(/^[0-[#]?\d{10,15}$/, { message: 'Invalid mobile number format' })
    .optional()
    .nullable(),
});

const adminUpdateUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }).optional(),
  mobileNumber: z.string().optional().nullable(),
});

const adminUpdateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  isActive: z.boolean().optional(),
}).refine((data) => data.status !== undefined || data.isActive !== undefined, {
  message: 'Either status (ACTIVE/INACTIVE) or isActive boolean must be provided',
});

module.exports = {
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  adminUpdateUserSchema,
  adminUpdateStatusSchema,
};

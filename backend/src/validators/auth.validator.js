const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  mobileNumber: z
    .string()
    .regex(/^[0-[#]?\d{10,15}$/, { message: 'Invalid mobile number format' })
    .optional()
    .or(z.literal('')),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
}).refine((data) => data.email || data.mobileNumber, {
  message: 'Either email or mobile number must be provided',
  path: ['email'],
});

const loginSchema = z
  .object({
    emailOrMobile: z.string().optional(),
    email: z.string().optional(),
    identifier: z.string().optional(),
    mobileNumber: z.string().optional(),
    password: z.string().min(1, { message: 'Password is required' }),
  })
  .refine(
    (data) => Boolean((data.emailOrMobile || data.email || data.identifier || data.mobileNumber || '').trim()),
    {
      message: 'Email or mobile number is required',
      path: ['emailOrMobile'],
    }
  );

module.exports = {
  registerSchema,
  loginSchema,
};

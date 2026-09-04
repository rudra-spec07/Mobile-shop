const dotenv = require('dotenv');
const { z } = require('zod');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL is required' }),
  JWT_SECRET: z.string().min(16, { message: 'JWT_SECRET must be at least 16 characters long' }),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  SUPER_ADMIN_EMAIL: z
    .string()
    .email({ message: 'SUPER_ADMIN_EMAIL must be a valid email address' })
    .default('admin@mobileadda.shop'),
  SUPER_ADMIN_PASSWORD: z
    .string()
    .min(8, { message: 'SUPER_ADMIN_PASSWORD must be at least 8 characters long' })
    .default('SuperAdmin123!'),
  RESET_TOKEN_EXPIRY: z.string().default('1h'),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables configuration:');
    result.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    });
    throw new Error('Environment configuration validation failed. Check your .env file.');
  }

  return result.data;
};

const env = parseEnv();

module.exports = env;

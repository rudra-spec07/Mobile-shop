const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { AppError } = require('../middleware/error.middleware');
const { HTTP_STATUS, ERROR_CODES, ROLES } = require('../utils/constants');
const notificationService = require('./notification.service');
const env = require('../config/env');

/**
 * Public Customer Registration Service
 * MANDATORY SECURITY RULE: Public registration ALWAYS creates a CUSTOMER.
 * Any role specified by the caller is strictly ignored.
 */
const registerCustomer = async (data) => {
  const { name, email, mobileNumber, password } = data;

  const normalizedEmail = email ? email.trim().toLowerCase() : null;
  const normalizedMobile = mobileNumber ? mobileNumber.trim() : null;

  // Check duplicate email or mobile number
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ...(normalizedMobile ? [{ mobileNumber: normalizedMobile }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new AppError(
      'An account with this email or mobile number already exists',
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.DUPLICATE_DATA
    );
  }

  // Hash password using bcrypt
  const hashedPassword = await hashPassword(password);

  // Perform INSERT operation in Neon PostgreSQL with enforced CUSTOMER role
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      mobileNumber: normalizedMobile,
      password: hashedPassword,
      role: ROLES.CUSTOMER, // Strict hardcoded role protection
      isActive: true,
    },
  });

  // Generate JWT token
  const token = generateToken({
    userId: newUser.id,
    role: newUser.role,
  });

  // Create Welcome Notification (Failure Isolated)
  notificationService.createNotification({
    userId: newUser.id,
    type: 'ACCOUNT_CREATED',
    channel: 'EMAIL',
    title: 'Welcome to Mobile-Adda!',
    message: 'Your customer account has been created successfully.',
  }).catch(() => {});

  // Remove password hash from returned user object
  const { password: _, ...userWithoutPassword } = newUser;

  return {
    user: userWithoutPassword,
    token,
  };
};

/**
 * Login Service for Customers and Super Admins
 */
const loginUser = async ({ emailOrMobile, password }) => {
  const queryTerm = emailOrMobile.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: queryTerm },
        { mobileNumber: emailOrMobile.trim() },
      ],
    },
  });

  if (!user) {
    throw new AppError(
      'Invalid email/mobile number or password',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated. Please contact support.',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.AUTHORIZATION_ERROR
    );
  }

  // Verify password with bcrypt
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new AppError(
      'Invalid email/mobile number or password',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

/**
 * Seed initial Super Admin account from validated environment configuration if none exists
 */
const seedInitialSuperAdmin = async () => {
  try {
    const adminCount = await prisma.user.count({
      where: { role: ROLES.SUPER_ADMIN },
    });

    if (adminCount === 0) {
      const adminEmail = env.SUPER_ADMIN_EMAIL.toLowerCase();
      const adminPassword = env.SUPER_ADMIN_PASSWORD;

      const hashedPassword = await hashPassword(adminPassword);
      await prisma.user.create({
        data: {
          name: 'Shop Super Admin',
          email: adminEmail,
          mobileNumber: '9999999999',
          password: hashedPassword,
          role: ROLES.SUPER_ADMIN,
          isActive: true,
        },
      });
      console.log(`✅ Seeded initial Super Admin account: ${adminEmail}`);
    }
  } catch (error) {
    console.error('⚠️  Failed to seed initial Super Admin account:', error.message);
  }
};

module.exports = {
  registerCustomer,
  loginUser,
  seedInitialSuperAdmin,
};

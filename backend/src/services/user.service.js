const crypto = require('crypto');
const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { AppError } = require('../middleware/error.middleware');
const { HTTP_STATUS, ERROR_CODES, ROLES } = require('../utils/constants');
const { parsePagination } = require('../utils/pagination');
const notificationService = require('./notification.service');
const env = require('../config/env');

/**
 * Handle forgot password request securely.
 * Accepts Email OR Mobile Number.
 * Always returns generic success response regardless of account existence.
 */
const forgotPassword = async (identifierInput) => {
  if (!identifierInput || typeof identifierInput !== 'string') {
    return {
      message: 'If the account exists, password reset instructions have been sent',
    };
  }

  const rawInput = identifierInput.trim();
  const normalizedEmail = rawInput.toLowerCase();
  const normalizedMobile = rawInput;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedEmail },
        { mobileNumber: normalizedMobile },
      ],
    },
  });

  if (user) {
    // Generate cryptographically secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Store only SHA-256 hash of token in database
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    // Token expires in 1 hour
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash,
        resetTokenExpiresAt,
      },
    });

    // Create & dispatch Password Reset Notification asynchronously (Failure Isolated)
    if (user.email) {
      const resetUrl = `${env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      notificationService.createNotification({
        userId: user.id,
        type: 'PASSWORD_RESET',
        channel: 'EMAIL',
        title: 'Password Reset Request',
        message: 'A password reset request was initiated for your Mobile-Adda account.',
        emailData: { resetUrl },
      }).catch((err) => console.error('⚠️ [ASYNC BACKGROUND ERROR]:', err?.message || err));
    } else {
      // System notification for mobile-only accounts
      // Note: Actual SMS delivery requires an external SMS gateway provider configuration
      notificationService.createNotification({
        userId: user.id,
        type: 'PASSWORD_RESET',
        channel: 'SYSTEM',
        title: 'Password Reset Request',
        message: 'A password reset request was initiated for your mobile account.',
      }).catch((err) => console.error('⚠️ [ASYNC BACKGROUND ERROR]:', err?.message || err));
    }
  }

  return {
    message: 'If the account exists, password reset instructions have been sent',
  };
};

/**
 * Reset user password using token
 */
const resetPassword = async ({ token, newPassword }) => {
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash,
      resetTokenExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError(
      'Invalid or expired password reset token',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.BAD_REQUEST
    );
  }

  // Hash new password using bcrypt
  const hashedPassword = await hashPassword(newPassword);

  // Update password and invalidate reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
  });

  return {
    message: 'Password reset successful. You can now login with your new password.',
  };
};

/**
 * Change current user password (Authenticated)
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Verify current password
  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError(
      'Current password is incorrect',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.BAD_REQUEST
    );
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: 'Password changed successfully',
  };
};

/**
 * Get authenticated user profile
 */
const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      mobileNumber: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  return user;
};

/**
 * Update authenticated user profile (Permitted fields only: name, mobileNumber)
 */
const updateUserProfile = async (userId, data) => {
  const allowedData = {};

  if (data.name !== undefined) allowedData.name = data.name.trim();
  if (data.mobileNumber !== undefined) {
    allowedData.mobileNumber = data.mobileNumber ? data.mobileNumber.trim() : null;
  }

  // Check unique mobileNumber constraint if changed
  if (allowedData.mobileNumber) {
    const existing = await prisma.user.findFirst({
      where: {
        mobileNumber: allowedData.mobileNumber,
        NOT: { id: userId },
      },
    });

    if (existing) {
      throw new AppError(
        'This mobile number is already in use by another account',
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.DUPLICATE_DATA
      );
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: allowedData,
    select: {
      id: true,
      name: true,
      email: true,
      mobileNumber: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Super Admin: Get paginated list of users with search filter
 */
const getAdminUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const search = query.search ? query.search.trim() : null;
  const status = query.status ? query.status.trim().toUpperCase() : null;

  const whereClause = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { mobileNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    if (status === 'ACTIVE') {
      whereClause.isActive = true;
    } else if (status === 'INACTIVE') {
      whereClause.isActive = false;
    }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            enquiries: true,
            requests: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
    },
  };
};

/**
 * Super Admin: Get user details by ID
 */
const getAdminUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      mobileNumber: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          enquiries: true,
          requests: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  return user;
};

/**
 * Super Admin: Update customer details
 */
const adminUpdateUser = async (id, data) => {
  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  const allowedData = {};
  if (data.name !== undefined) allowedData.name = data.name.trim();
  if (data.mobileNumber !== undefined) {
    allowedData.mobileNumber = data.mobileNumber ? data.mobileNumber.trim() : null;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: allowedData,
    select: {
      id: true,
      name: true,
      email: true,
      mobileNumber: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Super Admin: Update user active status (Activate / Deactivate)
 * Protects initial Super Admin from accidental deactivation.
 */
const adminUpdateUserStatus = async (id, data) => {
  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Protect Super Admin from deactivation
  if (targetUser.role === ROLES.SUPER_ADMIN) {
    throw new AppError(
      'Super Admin account status cannot be deactivated or modified',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.AUTHORIZATION_ERROR
    );
  }

  let newStatus = true;
  if (data.isActive !== undefined) {
    newStatus = Boolean(data.isActive);
  } else if (data.status !== undefined) {
    newStatus = data.status === 'ACTIVE';
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: newStatus },
    select: {
      id: true,
      name: true,
      email: true,
      mobileNumber: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const { createAuditLog } = require('./audit.service');
  createAuditLog({
    action: 'USER_STATUS_CHANGE',
    entityType: 'User',
    entityId: id,
    oldValue: { isActive: targetUser.isActive },
    newValue: { isActive: newStatus },
  });

  return updatedUser;
};

/**
 * DPDP Act Compliance: Export full user personal data (Data Principal Right)
 */
const exportUserData = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      mobileNumber: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      enquiries: {
        select: {
          id: true,
          subject: true,
          message: true,
          status: true,
          adminResponse: true,
          createdAt: true,
        },
      },
      requests: {
        select: {
          id: true,
          subject: true,
          status: true,
          notes: true,
          price: true,
          createdAt: true,
        },
      },
      notifications: {
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  const { createAuditLog } = require('./audit.service');
  createAuditLog({
    userId,
    action: 'DATA_EXPORT_REQUESTED',
    entityType: 'User',
    entityId: userId,
  });

  return {
    exportDate: new Date().toISOString(),
    dpdpNotice: 'Export generated pursuant to Section 11 of the Digital Personal Data Protection (DPDP) Act, 2023.',
    dataPrincipal: user,
  };
};

/**
 * DPDP Act Compliance: Withdraw optional consent (e.g. MARKETING_COMMUNICATION)
 * CRITICAL FIX: Does NOT deactivate or suspend user account login (isActive remains untouched)
 */
const withdrawConsent = async (userId, data = {}) => {
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  const purpose = data.purpose || 'MARKETING_COMMUNICATION';
  const reason = data.reason || 'Consent withdrawn via privacy preferences';

  // Audit consent withdrawal event
  const { createAuditLog } = require('./audit.service');
  createAuditLog({
    userId,
    action: 'CONSENT_WITHDRAWN',
    entityType: 'User',
    entityId: userId,
    oldValue: { purpose, status: 'GRANTED' },
    newValue: { purpose, status: 'WITHDRAWN', reason },
  });

  // Record structured ConsentRecord if Prisma model is active
  if (prisma.consentRecord) {
    try {
      const targetPurpose = purpose === 'ESSENTIAL_SERVICE' ? 'ESSENTIAL_SERVICE' : 'MARKETING_COMMUNICATION';
      const existingRecord = await prisma.consentRecord.findFirst({
        where: { userId, purpose: targetPurpose },
      });

      if (existingRecord) {
        await prisma.consentRecord.update({
          where: { id: existingRecord.id },
          data: {
            status: 'WITHDRAWN',
            withdrawnAt: new Date(),
          },
        });
      } else {
        await prisma.consentRecord.create({
          data: {
            userId,
            purpose: targetPurpose,
            status: 'WITHDRAWN',
            withdrawnAt: new Date(),
            source: 'WEB',
          },
        });
      }
    } catch (e) {
      console.warn('ConsentRecord insertion note:', e.message);
    }
  }

  return {
    message: `Consent for ${purpose} withdrawn successfully. Your account remains active for essential service requests.`,
    purpose,
    status: 'WITHDRAWN',
  };
};

/**
 * DPDP Act Compliance: Request Account / Data Erasure
 * CRITICAL FIX: Creates a PENDING auditable PrivacyRequest without immediate hard deletion or immediate account lockout.
 */
const requestDataErasure = async (userId, data = {}) => {
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  if (targetUser.role === ROLES.SUPER_ADMIN) {
    throw new AppError('Super Admin account erasure cannot be requested', HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTHORIZATION_ERROR);
  }

  const reason = data.reason || 'Data erasure requested by customer';

  // Audit data erasure request
  const { createAuditLog } = require('./audit.service');
  createAuditLog({
    userId,
    action: 'DATA_ERASURE_REQUESTED',
    entityType: 'User',
    entityId: userId,
    newValue: { status: 'PENDING', reason },
  });

  // Record PrivacyRequest if model is active
  if (prisma.privacyRequest) {
    try {
      const existingRequest = await prisma.privacyRequest.findFirst({
        where: { userId, type: 'DATA_ERASURE', status: 'PENDING' },
      });

      if (!existingRequest) {
        await prisma.privacyRequest.create({
          data: {
            userId,
            type: 'DATA_ERASURE',
            status: 'PENDING',
            reason,
          },
        });
      }
    } catch (e) {
      console.warn('PrivacyRequest insertion note:', e.message);
    }
  }

  return {
    message: 'Data erasure request submitted successfully. Our Privacy Officer will review and process your request pursuant to DPDP Act 2023 regulations. Completed service and order records will be retained as required by tax and legal regulations.',
    status: 'PENDING',
  };
};

module.exports = {
  forgotPassword,
  resetPassword,
  changePassword,
  getUserProfile,
  updateUserProfile,
  getAdminUsers,
  getAdminUserById,
  adminUpdateUser,
  adminUpdateUserStatus,
  exportUserData,
  withdrawConsent,
  requestDataErasure,
};

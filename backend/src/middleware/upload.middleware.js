const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');
const { sendError } = require('../utils/response');

/**
 * File upload validation helper for image uploads
 */
const validateImageUpload = (file) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit

  if (!file) {
    return { isValid: false, message: 'No file uploaded' };
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return { isValid: false, message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' };
  }

  if (file.size > maxSizeBytes) {
    return { isValid: false, message: 'File size exceeds maximum permitted limit of 5MB.' };
  }

  return { isValid: true };
};

/**
 * Placeholder upload middleware for handling file attachment validations
 */
const uploadMiddleware = (req, res, next) => {
  if (req.file) {
    const validation = validateImageUpload(req.file);
    if (!validation.isValid) {
      return sendError(res, validation.message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }
  }
  return next();
};

module.exports = {
  validateImageUpload,
  uploadMiddleware,
};

const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');
const { sendError } = require('../utils/response');

/**
 * Reusable Zod validation middleware
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @param {'body' | 'params' | 'query'} target - Request property to validate (default: 'body')
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      return sendError(res, `Validation error: ${formattedErrors}`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }

    // Assign sanitized data back to request
    req[target] = result.data;
    return next();
  };
};

module.exports = {
  validate,
};

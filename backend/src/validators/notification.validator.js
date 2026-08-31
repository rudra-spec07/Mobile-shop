const { z } = require('zod');

const getNotificationsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});

const notificationIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid notification ID format' }),
});

module.exports = {
  getNotificationsQuerySchema,
  notificationIdParamSchema,
};

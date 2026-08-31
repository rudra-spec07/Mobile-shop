const express = require('express');
const { getHealthStatus, getDatabaseHealth } = require('../controllers/health.controller');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const adminUserRoutes = require('./admin.user.routes');
const brandRoutes = require('./brand.routes');
const mobileRoutes = require('./mobile.routes');
const partCategoryRoutes = require('./partCategory.routes');
const partRoutes = require('./part.routes');
const inventoryRoutes = require('./inventory.routes');
const catalogRoutes = require('./catalog.routes');
const enquiryRoutes = require('./enquiry.routes');
const adminEnquiryRoutes = require('./admin.enquiry.routes');
const requestRoutes = require('./request.routes');
const adminRequestRoutes = require('./admin.request.routes');
const adminDashboardRoutes = require('./admin-dashboard.routes');
const notificationRoutes = require('./notification.routes');

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System Health Check
 *     description: Returns current operational status of Mobile-Adda backend.
 *     tags:
 *       - System
 */
router.get('/health', getHealthStatus);

/**
 * @openapi
 * /health/database:
 *   get:
 *     summary: Database Health Check
 *     description: Verifies active connectivity with Neon PostgreSQL database.
 *     tags:
 *       - System
 */
router.get('/health/database', getDatabaseHealth);


// Mount Authentication Domain Routes
router.use('/auth', authRoutes);

// Mount Customer Profile Routes
router.use('/users', userRoutes);

// Mount Super Admin User Management Routes
router.use('/admin/users', adminUserRoutes);

// Mount Module 3 Catalog Management Routes
router.use('/brands', brandRoutes);
router.use('/mobiles', mobileRoutes);

// Mount Module 4 Parts & Inventory Management Routes
router.use('/part-categories', partCategoryRoutes);
router.use('/parts', partRoutes);
router.use('/inventory', inventoryRoutes);

// Mount Module 5 Unified Search & Catalog Discovery Routes
router.use('/', catalogRoutes);

// Mount Module 6 Customer Interaction & Enquiry Management Routes
router.use('/enquiries', enquiryRoutes);
router.use('/admin/enquiries', adminEnquiryRoutes);

// Mount Module 7 Orders / Service Requests Management Routes
router.use('/requests', requestRoutes);
router.use('/admin/requests', adminRequestRoutes);

// Mount Module 8 Superadmin Dashboard & Management Routes
router.use('/admin/dashboard', adminDashboardRoutes);

const adminDashboardController = require('../controllers/admin-dashboard.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');
router.get('/admin/audit-logs', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), adminDashboardController.getAuditLogs);

// Mount Module 9 Notifications & Communication Routes
router.use('/notifications', notificationRoutes);

module.exports = router;

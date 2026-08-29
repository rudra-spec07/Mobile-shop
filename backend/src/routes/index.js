const express = require('express');
const { getHealthStatus } = require('../controllers/health.controller');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const adminUserRoutes = require('./admin.user.routes');
const brandRoutes = require('./brand.routes');
const mobileRoutes = require('./mobile.routes');

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

// Mount Authentication Domain Routes
router.use('/auth', authRoutes);

// Mount Customer Profile Routes
router.use('/users', userRoutes);

// Mount Super Admin User Management Routes
router.use('/admin/users', adminUserRoutes);

// Mount Module 3 Catalog Management Routes
router.use('/brands', brandRoutes);
router.use('/mobiles', mobileRoutes);

module.exports = router;

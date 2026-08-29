const express = require('express');
const { getHealthStatus } = require('../controllers/health.controller');
const authRoutes = require('./auth.routes');

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System Health Check
 *     description: Returns current operational status of Mobile-Adda backend.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Backend is running smoothly
 */
router.get('/health', getHealthStatus);

// Mount Authentication Domain Routes
router.use('/auth', authRoutes);

module.exports = router;

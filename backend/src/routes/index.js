const express = require('express');
const { getHealthStatus } = require('../controllers/health.controller');

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/health', getHealthStatus);

module.exports = router;

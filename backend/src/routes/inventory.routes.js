const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Super Admin Inventory Reports & Summary
router.get('/low-stock', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), inventoryController.getLowStockReport);
router.get('/out-of-stock', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), inventoryController.getOutOfStockReport);
router.get('/summary', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), inventoryController.getInventorySummary);

module.exports = router;

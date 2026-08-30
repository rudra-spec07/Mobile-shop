const express = require('express');
const partController = require('../controllers/part.controller');
const inventoryController = require('../controllers/inventory.controller');
const { authenticateToken, optionalAuthenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Public / Customer & Admin Read Routes
router.get('/', optionalAuthenticate, partController.getParts);
router.get('/:id', optionalAuthenticate, partController.getPartById);

// Super Admin Management Routes
router.post('/', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), partController.createPart);
router.patch('/:id', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), partController.updatePart);
router.patch('/:id/status', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), partController.updatePartStatus);

// Super Admin Stock Operations & Inventory History Routes
router.post('/:id/stock-in', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), inventoryController.stockIn);
router.post('/:id/stock-out', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), inventoryController.stockOut);
router.post('/:id/stock-adjustment', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), inventoryController.stockAdjustment);
router.get('/:id/inventory-history', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), inventoryController.getInventoryHistory);

module.exports = router;

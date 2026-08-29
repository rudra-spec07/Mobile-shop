const express = require('express');
const brandController = require('../controllers/brand.controller');
const { authenticateToken, optionalAuthenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Public / Customer & Admin Read Routes
router.get('/', optionalAuthenticate, brandController.getBrands);
router.get('/:id', optionalAuthenticate, brandController.getBrandById);

// Super Admin Only Management Routes
router.post('/', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), brandController.createBrand);
router.patch('/:id', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), brandController.updateBrand);
router.patch('/:id/status', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), brandController.updateBrandStatus);

module.exports = router;

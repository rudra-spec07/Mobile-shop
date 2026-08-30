const express = require('express');
const partCategoryController = require('../controllers/partCategory.controller');
const { authenticateToken, optionalAuthenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Public / Customer & Admin Read Routes
router.get('/', optionalAuthenticate, partCategoryController.getCategories);
router.get('/:id', optionalAuthenticate, partCategoryController.getCategoryById);

// Super Admin Only Management Routes
router.post('/', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), partCategoryController.createCategory);
router.patch('/:id', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), partCategoryController.updateCategory);
router.patch('/:id/status', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), partCategoryController.updateCategoryStatus);

module.exports = router;

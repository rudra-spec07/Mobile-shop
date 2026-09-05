const express = require('express');
const mobileController = require('../controllers/mobile.controller');
const mobileImageController = require('../controllers/mobile-image.controller');
const { authenticateToken, optionalAuthenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { singleImageUpload } = require('../middleware/upload.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Public / Customer & Admin Read Routes
router.get('/featured', optionalAuthenticate, mobileController.getFeaturedMobiles);
router.get('/', optionalAuthenticate, mobileController.getMobiles);
router.get('/:id', optionalAuthenticate, mobileController.getMobileById);
router.get('/:id/images', optionalAuthenticate, mobileImageController.getMobileImages);

// Super Admin Only Mobile Management Routes
router.post('/', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), singleImageUpload, mobileController.createMobile);
router.patch('/:id', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), mobileController.updateMobile);
router.patch('/:id/status', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), mobileController.updateMobileStatus);
router.patch('/:id/featured', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), mobileController.updateFeaturedStatus);

// Super Admin Only Mobile Image Management Routes
router.post('/:id/images', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), singleImageUpload, mobileImageController.addImage);
router.put('/:id/images/:imageId', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), singleImageUpload, mobileImageController.replaceImage);
router.patch('/:id/images/:imageId/primary', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), mobileImageController.setPrimaryImage);
router.delete('/:id/images/:imageId', authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN), mobileImageController.deleteImage);

module.exports = router;

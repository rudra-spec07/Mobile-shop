const express = require('express');
const enquiryController = require('../controllers/enquiry.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Super Admin Only Enquiry Management Routes
router.use(authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN));

router.get('/', enquiryController.getAdminEnquiries);
router.get('/:id', enquiryController.getEnquiryById);
router.patch('/:id/respond', enquiryController.respondToEnquiry);
router.patch('/:id/status', enquiryController.updateEnquiryStatus);

module.exports = router;

const express = require('express');
const enquiryController = require('../controllers/enquiry.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Customer Enquiry Routes (Require Authentication)
router.use(authenticateToken);

router.post('/', enquiryController.createEnquiry);
router.get('/my', enquiryController.getMyEnquiries);
router.get('/:id', enquiryController.getEnquiryById);
router.patch('/:id/cancel', enquiryController.cancelEnquiry);

module.exports = router;

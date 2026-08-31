const express = require('express');
const requestController = require('../controllers/request.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Customer Service Request Routes (Require Authentication)
router.use(authenticateToken);

router.post('/', requestController.createRequest);
router.get('/my', requestController.getMyRequests);
router.get('/:id', requestController.getRequestById);
router.patch('/:id/cancel', requestController.cancelCustomerRequest);

module.exports = router;

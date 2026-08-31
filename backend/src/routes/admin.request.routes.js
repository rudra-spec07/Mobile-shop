const express = require('express');
const requestController = require('../controllers/request.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Super Admin Only Service Request Management Routes
router.use(authenticateToken, authorizeRoles(ROLES.SUPER_ADMIN));

router.get('/', requestController.getAdminRequests);
router.get('/:id', requestController.getRequestById);
router.patch('/:id/confirm', requestController.confirmRequest);
router.patch('/:id/process', requestController.processRequest);
router.patch('/:id/complete', requestController.completeRequest);
router.patch('/:id/cancel', requestController.adminCancelRequest);
router.patch('/:id/reject-cancellation', requestController.rejectCancellationRequest);
router.patch('/:id/status', requestController.updateRequestStatus);

module.exports = router;

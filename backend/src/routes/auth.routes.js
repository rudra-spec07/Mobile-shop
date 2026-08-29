const express = require('express');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const { validate } = require('../middleware/validation.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { forgotPasswordSchema, resetPasswordSchema } = require('../validators/user.validator');

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Public Customer Registration
 *     description: Creates a new customer account in Neon PostgreSQL. Enforces CUSTOMER role.
 *     tags:
 *       - Authentication
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates Customer or Super Admin users and returns JWT token.
 *     tags:
 *       - Authentication
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: User Logout
 *     description: Stateless logout endpoint for client-side JWT removal.
 *     tags:
 *       - Authentication
 */
router.post('/logout', userController.logout);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request Password Reset
 *     description: Sends a password reset token request. Returns generic success response.
 *     tags:
 *       - Authentication
 */
router.post('/forgot-password', validate(forgotPasswordSchema), userController.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset Password with Token
 *     description: Resets user password using a valid reset token.
 *     tags:
 *       - Authentication
 */
router.post('/reset-password', validate(resetPasswordSchema), userController.resetPassword);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get Authenticated User Profile (Legacy/Alias)
 *     tags:
 *       - Authentication
 */
router.get('/me', authenticateToken, authController.getProfile);

module.exports = router;

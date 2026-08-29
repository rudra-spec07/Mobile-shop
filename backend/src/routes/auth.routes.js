const express = require('express');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Public Customer Registration
 *     description: Creates a new customer account in Neon PostgreSQL. Enforces CUSTOMER role.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobileNumber:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or mobile number already exists
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrMobile
 *               - password
 *             properties:
 *               emailOrMobile:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get Authenticated User Profile
 *     description: Returns profile details for current JWT bearer token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateToken, authController.getProfile);

module.exports = router;

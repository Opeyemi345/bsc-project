import { Router } from "express";
import {
    login,
    token,
    requestPasswordReset,
    resetPassword,
    requestEmailVerification,
    verifyEmail
} from "../controllers/auth";

const authRoute = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username or email
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
authRoute.post('/login', login);

// Legacy endpoint
authRoute.post('/token', token);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 */
authRoute.post('/forgot-password', requestPasswordReset);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 */
authRoute.post('/reset-password/:token', resetPassword);

/**
 * @swagger
 * /auth/request-verification:
 *   post:
 *     summary: Request email verification
 *     tags: [Authentication]
 */
authRoute.post('/request-verification', requestEmailVerification);

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   get:
 *     summary: Verify email with token
 *     tags: [Authentication]
 */
authRoute.get('/verify-email/:token', verifyEmail);

export default authRoute;
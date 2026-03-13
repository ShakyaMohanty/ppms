import { Router } from 'express';
import * as User  from '../controllers/users.controller.js'
// import {verifySession} from '../middlewares/session.middleware.js'

const router = Router();
/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/signup', User.signupUser)
/**
 * @swagger
 * /signin:
 *   post:
 *     summary: Sign in
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 */
router.post('/signin', User.signinUser)
/**
 * @swagger
 * /signout:
 *   delete:
 *     summary: Log out user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Signed out successfully
 */
// router.delete('/signout', verifySession, User.signoutUser)
router.delete('/signout', User.signoutUser);
/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset email sent successfully
 *       404:
 *         description: Email not found
 */
router.post('/forgot-password', User.forgotPassword)
// router.put('/updatePass', User.testUpdatePassword)

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset password using a token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: The reset token received via email
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', User.resetPassword)
export default router;
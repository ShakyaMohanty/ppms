import Router from 'express';
import { verifySession } from '../middlewares/session.middleware.js';
import { checkRole } from '../middlewares/verifyRole.middleware.js';

const router = Router();

// write swagger doc for this route
/**
 * @swagger
 * /test:
 *   post:
 *     summary: Test route to verify session and role-based access control
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test route accessed successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

router.post('/test', verifySession, checkRole(['Admin']), (req, res) => {
    console.log('Inside /test route');
    res.json({message: "Test route accessed successfully", user: req.user});
});

export default router;

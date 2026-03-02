import Router from 'express';
import { verifySession } from '../middlewares/session.middleware.js';
import { checkRole } from '../middlewares/verifyRole.middleware.js';

const router = Router();

router.post('/test', verifySession, checkRole(['Admin']), (req, res) => {
    console.log('Inside /test route');
    res.json({message: "Test route accessed successfully", user: req.user});
});

export default router;

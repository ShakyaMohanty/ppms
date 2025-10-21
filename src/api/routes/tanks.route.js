import Router from 'express';
import * as Tank from '../controllers/tanks.controller.js';
import { verifySession } from '../middlewares/session.middleware.js';
import { checkRole } from '../middlewares/verifyRole.middleware.js';

const router = Router();

// router.get('/tanks', verifySession, checkRole(['Admin', 'Manager', 'Operator', 'Accountant']), Tank.getAllTanks);
// router.get('/tanks/:id', verifySession, Tank.getSingleTank);
router.post('/tanks', verifySession, checkRole(['Admin', 'Manager']), Tank.addTank);
router.put('/tanks/:id', verifySession, checkRole(['Admin']), Tank.editTank);
// router.delete('/tanks/:id', verifySession, checkRole(['Admin']), Tank.deleteTank);

export default router;

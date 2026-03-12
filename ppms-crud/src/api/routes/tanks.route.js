import Router from 'express';
import * as Tank from '../controllers/tanks.controller.js';
import { verifySession } from '../middlewares/session.middleware.js';
import { checkRole } from '../middlewares/verifyRole.middleware.js';

const router = Router();

router.get('/tanks', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Tank.getAllTanks);
router.get('/tanks/:id', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Tank.getSingleTank);
router.post('/tanks', verifySession, checkRole(['Admin', 'Manager']), Tank.addTank);
router.put('/tanks/:id', verifySession, checkRole(['Admin', 'Manager']), Tank.editTank);
router.delete('/tanks/:id', verifySession, checkRole(['Admin', 'Manager']), Tank.deleteTank);
router.get('/tanks/fuel-types/:fuel_type', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Tank.getAllTanksByFuelType);
router.get('/tanks/get-fuel-types', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Tank.getTankFuelTypes);
router.get('/only', (req, res) => {
    res.status(200).json({message: `successfully getting all tanks`});
});

export default router;

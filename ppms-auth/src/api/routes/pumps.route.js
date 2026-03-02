import Router from 'express';
import * as Pump from '../controllers/pumps.controller.js';
import { verifySession } from '../middlewares/session.middleware.js';
import { checkRole } from '../middlewares/verifyRole.middleware.js';

const router = Router();

router.get('/pumps', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Pump.getAllPumps);
router.get('/pumps/:id', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Pump.getSinglePump);
router.post('/pumps', verifySession, checkRole(['Admin', 'Manager']), Pump.addPump);
router.put('/pumps/:id', verifySession, checkRole(['Admin', 'Manager']), Pump.editPump);
router.delete('/pumps/:id', verifySession, checkRole(['Admin', 'Manager']), Pump.deletePump);
// router.get('/pumps/fuel-types/:fuel_type', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Pump.getAllPumpsByFuelType);
// router.get('/pumps/get-fuel-types', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Pump.getTankFuelTypes);
export default router;

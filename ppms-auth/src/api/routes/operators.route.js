import Router from 'express';
import * as Operator from '../controllers/operators.controller.js';
import { verifySession } from '../middlewares/session.middleware.js';
import { checkRole } from '../middlewares/verifyRole.middleware.js';

const router = Router();

router.get('/operators', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Operator.getAllOperators);
router.get('/operators/:id', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Operator.getSingleOperator);
router.post('/operators', verifySession, checkRole(['Admin', 'Manager']), Operator.addOperator);
router.put('/operators/:id', verifySession, checkRole(['Admin', 'Manager']), Operator.editOperator);
router.delete('/operators/:id', verifySession, checkRole(['Admin', 'Manager']), Operator.deleteOperator);
// router.patch('/operators/assign-shift-pump', verifySession, checkRole(['Admin', 'Manager']), Operator.assignShiftAndPump);
// router.patch('/operators/assign-user', verifySession, checkRole(['Admin', 'Manager']), Operator.assignUserToOperator);
// router.get('/operators/fuel-types/:fuel_type', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Operator.getAllOperatorsByFuelType);
// router.get('/operators/get-fuel-types', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Operator.getTankFuelTypes);
export default router;

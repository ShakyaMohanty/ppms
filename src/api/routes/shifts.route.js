import { Router } from "express";
import { verifySession } from "../middlewares/session.middleware.js";
import { checkRole } from "../middlewares/verifyRole.middleware.js";
import * as Shift from '../controllers/shifts.controller.js'
const router = Router()

// adding custom middleware for session verification, and RBC access management.
router.get('/shifts', verifySession,checkRole(['Admin', 'Manager', 'Operator', 'Accountant']), Shift.getAllShifts);
router.get('/shifts/:id', verifySession, Shift.getSingleShift);
router.post('/shifts', verifySession, checkRole(['Admin', 'Manager']), Shift.addShift);
router.put('/shifts/:id', verifySession, checkRole(['Admin']), Shift.updateShift);
router.delete('/shifts/:id', verifySession, checkRole(['Admin']), Shift.deleteShift);
router.patch('/shifts/:id', verifySession, checkRole(['Admin']), Shift.changeShiftStatus);

export default router;

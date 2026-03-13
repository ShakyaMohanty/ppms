import { Router } from "express";
import { verifySession } from "../middlewares/session.middleware.js";
import { checkRole } from "../middlewares/verifyRole.middleware.js";
import * as Shift from '../controllers/shifts.controller.js'
const router = Router()

// adding custom middleware for session verification, and RBC access management.
// add swagger documentation for these routes

/**
 * @swagger
 * tags:
 *   name: Shifts
 *   description: Shift management for operators
 */

/**
 * @swagger
 * /shifts:
 *   get:
 *     summary: Get all shifts
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of shifts
 */

/**
 * @swagger
 * /shifts/{id}:
 *   get:
 *     summary: Get shift by ID
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift details
 */

/**
 * @swagger
 * /shifts:
 *   post:
 *     summary: Add a new shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shiftName:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               status:
 *                 type: string
 */

/**
 * @swagger
 * /shifts/{id}:
 *   put:
 *     summary: Update a shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shift ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shiftName:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               status:
 *                 type: string
 */
/** * @swagger
 * /shifts/{id}:
 *   delete:
 *     summary: Delete a shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shift ID
 */

/**
 * @swagger
 * /shifts/{id}:
 *   patch:
 *     summary: Change shift status (Active/Inactive)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shift ID
 */
router.get('/shifts', verifySession,checkRole(['Admin', 'Manager', 'Operator', 'Accountant']), Shift.getAllShifts);
router.get('/shifts/:id', verifySession, Shift.getSingleShift);
router.post('/shifts', verifySession, checkRole(['Admin', 'Manager']), Shift.addShift);
router.put('/shifts/:id', verifySession, checkRole(['Admin']), Shift.updateShift);
router.delete('/shifts/:id', verifySession, checkRole(['Admin']), Shift.deleteShift);
router.patch('/shifts/:id', verifySession, checkRole(['Admin']), Shift.changeShiftStatus);

export default router;

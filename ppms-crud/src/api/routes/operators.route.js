import Router from 'express';
import * as Operator from '../controllers/operators.controller.js';
import { verifySession } from '../middlewares/session.middleware.js';
import { checkRole } from '../middlewares/verifyRole.middleware.js';

const router = Router();

// add swagger documentation for these routes
/**
 * @swagger
 * tags:
 *   name: Operators
 *   description: Operator management
 */

/**
 * @swagger
 * /operators:
 *   get:
 *     summary: Get all operators
 *     tags: [Operators]
 *     responses:
 *       200:
 *         description: A list of operators
 */ 
router.get('/operators', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Operator.getAllOperators);
/** * @swagger
 * /operators/{id}:
 *   get:
 *     summary: Get operator by ID
 *     tags: [Operators]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Operator ID
 *     responses:
 *       200:
 *         description: Operator details
 */
router.get('/operators/:id', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Operator.getSingleOperator);
/** @swagger
 * /operators:
 *   post:
 *     summary: Add a new operator
 *     tags: [Operators]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fuel_type:
 *                 type: string
 *               shift_id:
 *                 type: integer
 *               pump_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Operator created successfully
 */
router.post('/operators', verifySession, checkRole(['Admin', 'Manager']), Operator.addOperator);
/** @swagger
 * /operators/{id}:
 *   put:
 *     summary: Edit an operator
 *     tags: [Operators]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Operator ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fuel_type:
 *                 type: string
 *               shift_id:
 *                 type: integer
 *               pump_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Operator updated successfully
 */
router.put('/operators/:id', verifySession, checkRole(['Admin', 'Manager']), Operator.editOperator);
/** @swagger
 * /operators/{id}:
 *   delete:
 *     summary: Delete an operator
 *     tags: [Operators]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Operator ID
 *     responses:
 *       200:
 *         description: Operator deleted successfully
 */
router.delete('/operators/:id', verifySession, checkRole(['Admin', 'Manager']), Operator.deleteOperator);
// router.patch('/operators/assign-shift-pump', verifySession, checkRole(['Admin', 'Manager']), Operator.assignShiftAndPump);
// router.patch('/operators/assign-user', verifySession, checkRole(['Admin', 'Manager']), Operator.assignUserToOperator);
// router.get('/operators/fuel-types/:fuel_type', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Operator.getAllOperatorsByFuelType);
// router.get('/operators/get-fuel-types', verifySession, checkRole(['Admin', 'Manager', 'Operator']), Operator.getTankFuelTypes);
export default router;

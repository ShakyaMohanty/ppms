import { Router } from 'express';
import * as User  from '../controllers/users.controller.js'
import {verifySession} from '../middlewares/session.middleware.js'
import { checkRole } from '../middlewares/verifyRole.middleware.js';
const router = Router();

router.post('/signup', User.signupUser)
router.post('/signin', User.signinUser)
router.get('/admin-panel', verifySession, checkRole(['Admin', 'Manager']), (req, res)=>{
    res.status(200).json({message: 'Accessing Admin Panel successful', user: req.user})
})
router.delete('/signout', verifySession, User.signoutUser)
router.post('/forgot-password', User.forgotPassword)
// router.put('/updatePass', User.testUpdatePassword)
router.post('/reset-password', User.resetPassword)
export default router;
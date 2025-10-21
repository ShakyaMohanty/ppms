import * as userModel from '../models/users.model.js'
import {sendPasswordResetEmail} from '../services/resendEmailService.js'
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import crypto from 'crypto'

const signupUser = async (req, res) => {
    const {username, email, password} = req.body

    if (!username || !email || !password){
        return res.status(400).json({error: `Username, password, and email are required.`});
    }
    if(req.body.role){
        return res.status(400).json({error: `Can not assign role!`})
    }
    const checkUserRole = await userModel.findUserByUsername(username);
    
    if (checkUserRole) {
        if (checkUserRole.role === 'Admin') {
            return res.status(400).json({ error: 'Admin already exists!' });
        } else {
            return res.status(400).json({ error: 'Username already taken!' });
        }
    }
    
    try{
        const hassedPassword = await bcrypt.hash(password, 10);
        const result = await userModel.createUser(username, email, hassedPassword);
        const userId = result.insertId;

        const createdUser = await userModel.findUserById(userId);
        if (!createdUser) {
            return res.status(500).json({ error: 'User was created but could not be fetched.' });
        }
        return res.status(201).json({success: `user created successfully`, user: createdUser.username })
    }catch(error){
        console.error('Signup error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: `Username or email already exists` });
        }
        res.status(500).json({error: `Faild to create User`})
    }
   
   
}

// const testUpdatePassword = async (req, res) => {
//     const {username, password} = req.body;
//     console.log('rrr')
//     try{
//         const hassedPassword = await bcrypt.hash(password, 10);
//         const [result] = await pool.execute(`UPDATE users SET password_hash = ? WHERE username = ?`, [hassedPassword, username])
//         res.status(200).json({success: `password updated`})
//     }catch(error){
//         console.log(error)
//         res.status(500).json({error: `update failed: ${error}`})
//     }
    
   
// }
const signinUser = async (req, res) => {
    const {username, password} = req.body;
    const user =  await userModel.findUserByUsername(username);
    // console.log(user)
    if(!user){
       return res.status(404).json({error: `User not found!`})
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash)
    if(!isPasswordMatch){
        return res.status(400).json({ message: 'Password doesn\'t match' });
    }else{
        const sessionId = v4();
        const oneMinute = 1 * 60 * 1000;
        const fiveMinute = 5 * 60 * 1000;
        const oneHour = 1 * 60 * 60 * 1000
        const sessionExpiryTime = new Date(Date.now() + oneHour);
        const userId = user.user_id
        try{
            const updatedSession = await userModel.addSessionToUser(sessionId, sessionExpiryTime, userId)
            if(!updatedSession) {
               return res.status(400).json({error: `session failed to update!`})
            }
            const sessionUser = await userModel.findUserById(userId);
            const liveSessionId = sessionUser.session_id
            const liveSessionExpiryTime = sessionUser.session_expiry_time

            // Set the cookie with the secure flags
            res.cookie('sessionId', liveSessionId, {
                httpOnly: true, // Prevents client-side JS from accessing the cookie
                secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
                sameSite: 'strict', // Mitigates CSRF
                expires: liveSessionExpiryTime, // Set the cookie expiry to match the database
                path: '/' // Ensure the cookie is accessible from all paths
            });
            res.status(200).json({success: `You are logged in!`, user: sessionUser.username})

        }catch(error){
            // Log the error for internal debugging
            console.error('Error in /signin:', error);
            res.status(400).json({message: `somthing went wrong: ${error}`})
        }
  
    }

}

const signoutUser = async (req, res) => {
    try {
        const user = req.user;
        if(!user){
            return res.status(404).json({ message: "User not Authenticated..." });
        }
        const sessionId = req.user.session_id;
        const result = await userModel.removeSessionBySessionId(sessionId)
        if(result.affectedRows > 0){
            return res.status(200).json({message: `Logged out successfully..`, notification: `Please remove token from client storage.`})
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: `something went wrong...`})
    }
}


const forgotPassword = async (req, res) => {
    const email = req.body.email;
    const successResponse = { message: 'If a matching account is found, a password reset link has been sent to your email.' };
    try{
        if (req.headers.authorization || req.headers.Authorization) {
            return res.status(400).json({ message: "You are already logged in." });
        }
        const user = await userModel.findUserByEmail(email)
        if(!user){
            return res.status(401).json({message: `No user found in this email...`})
        }
        const resetString = crypto.randomBytes(32).toString("hex");
        const hashedResetString = await bcrypt.hash(resetString, 10);
        const threeMinute = 3 * 60 * 1000;
        const resetStringExpiryTime = new Date(Date.now()+threeMinute);
        const addedResetString = await userModel.addPasswordResetString(user.user_id, hashedResetString, resetStringExpiryTime)

        if(!addedResetString){
            return res.status(400).json({message: `failed to add reset-string for Forgot Password!`})
        }
        const addedPassedReset = await sendPasswordResetEmail(email, resetString);
        if(!addedPassedReset){
            return res.status(400).json({message: `sending reset token to mail failed...`})
        }
        if (process.env.NODE_ENV === 'development') { // Use an environment variable to control this
            return res.status(200).json({ ...successResponse, resetString: resetString, email: email });
        }else if (process.env.NODE_ENV === 'production'){
            // handle resetString through client side code.
            return res.status(200).json({message: `Successfully send reset password token to mail id`, email: email})
        }
       

    }catch(error){
        console.error('Password reset request failed:', error);
        return res.status(500).json({ message: 'Failed to send password reset email.' });
    }
}

const resetPassword = async (req, res) => {
    const {newPassword, resetString, email} = req.body;

    try {
        if(!resetString || !newPassword || !email){
            return res.status(400).json({message: `required fields in the body are missing...`})
        }
        
        const resetPasswordUser = await userModel.findUserByEmail(email);
        if(!resetPasswordUser){
            return res.status(404).json({message: `Invalid or expired token.`})
        }
        const hashedResetString = resetPasswordUser.reset_password_token;
        const resetStringExpiryTime = resetPasswordUser.reset_password_token_expiry;

        if(resetStringExpiryTime === null || resetStringExpiryTime < new Date()){
            return res.status(401).json({message: `reset password string expired after 3 min...`})
        }
        const isTokenMatch = await bcrypt.compare(resetString, hashedResetString);
        if(!isTokenMatch){
            return res.status(400).json({message: `token doesn't match...`})
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const isPasswordReset = await userModel.resetPasswordByEmail(hashedPassword, email);

        if(isPasswordReset.affectedRows > 0){
            return res.status(200).json({message: `password reset successfull...`})
        }else{
            return res.status(400).json({message: `password reset failed...`})
        }
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:  `somthing went wrong...`})
    }
}
export { signupUser, signinUser, signoutUser, forgotPassword, resetPassword };


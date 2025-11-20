import * as userModel from '../models/users.model.js'
import {sendPasswordResetEmail} from '../services/resendEmailService.js'
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import crypto from 'crypto'
import logger from '../services/logger.js';

const signupUser = async (req, res) => {
    const {username, email, password} = req.body

    if (!username || !email || !password){

        logger.warn({
            errorMessage: "Signup validation failed",
            reason: "Missing fields",
            endpoint: "/signup",
            body: {username, email, password},
            status: 400
        })

        return res.status(400).json({error: `Username, password, and email are required.`});
    }
    if(req.body.role){

        logger.warn({
            errorMessage: "Attempt to assign role during signup",
            username,
            endpoint: "/signup",
            status: 400,
        });

        return res.status(400).json({error: `Can not assign role!`})
    }
    const checkUserRole = await userModel.findUserByUsername(username);
    
    if (checkUserRole) {
        if (checkUserRole.role === 'Admin') {

            logger.warn({
                errorMessage: "Admin signup rejected, Admin already exists",
                username,
                role: "Admin",
                endpoint: "/signup",
                status: 400,
            })

            return res.status(400).json({ error: 'Admin already exists!' });
        } else {

            logger.warn({
                errorMessage: "Username already taken",
                username,
                endpoint: "/signup",
                status: 400,
            })

            return res.status(400).json({ error: 'Username already taken!' });
        }
    }
    
    try{
        const hassedPassword = await bcrypt.hash(password, 10);
        const result = await userModel.createUser(username, email, hassedPassword);
        const userId = result.insertId;

        const createdUser = await userModel.findUserById(userId);
        if (!createdUser) {

            logger.error({
                errorMessage: "User created but not fetching from DB",
                userId,
                username,
                endpoint: "/signup",
                status: 500
            })

            return res.status(500).json({ error: 'User was created but could not be fetched.' });
        }

        logger.info({
            successMessage: "User created successfully",
            userId,
            username: createdUser.username,
            email,
            endpoint: "/signup",
            status: 201
        })

        return res.status(201).json({success: `user created successfully`, user: createdUser.username })
    }catch(error){

        logger.error({
            errorMessage: "Signup failed",
            error: error.message,
            code: error.code,
            stack: error.stack,
            endpoint: "/signup",
            status: error.code === "ER_DUP_ENTRY" ? 409 : 500
        });

        console.error('Signup error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: `Username or email already exists` });
        }
        res.status(500).json({error: `Faild to create User`})
    }
   
   
}

const signinUser = async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password){

        logger.warn({
            errorMessage: "Signin validation failed",
            reason: "Missing fields",
            endpoint: "/signin",
            body: {username, password},
            status: 400
        })

        return res.status(400).json({error: `Username, password, and email are required.`});
    }
    const user =  await userModel.findUserByUsername(username);
    // console.log(user)
    if(!user){

        logger.warn({    
            errorMessage: `User not found by username ${username}`,
            username,
            endpoint: "/signin",
            status: 404 
        })

        return res.status(404).json({error: `User not found!`})
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash)
    if(!isPasswordMatch){

        logger.warn({
            errorMessage: `Password doesn\'t match for user ${username}`,
            username,
            endpoint: "/signin",
            status: 400
        })

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

                logger.error({
                    errorMessage: `Session id and session exp time failed to update while login`,
                    username,
                    endpoint: "/signin",
                    status: 400
                })

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

            logger.info({
                successMessage: `User successfully logged in`, 
                username,
                endpoint: "/signin",
                status: 200

            })
            res.status(200).json({success: `You are logged in!`, user: sessionUser.username})

        }catch(error){

            logger.error({
                errorMessage: `Something went wrong, error while login`,
                username,
                endpoint: "/signin",
                status: 400

            })

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

            logger.warn({
                errorMessage: `User is not in any session`,
                endpoint: '/signout',
                status: 404
            })

            return res.status(404).json({ message: "User not Authenticated..." });
        }
        const sessionId = req.user.session_id;
        const result = await userModel.removeSessionBySessionId(sessionId)
        if(result.affectedRows > 0){

            logger.info({
                successMessage: `User logged out successfully`,
                endpoint: "/signout",
                status: 200
            })

            return res.status(200).json({message: `Logged out successfully..`, notification: `Please remove token from client storage.`})
        }
    } catch (error) {

        logger.error({
            errorMessage: `Something went wrong`,
            endpoint: "/signout",
            status: 500
        })
        console.log(error)
        return res.status(500).json({message: `something went wrong...`})
    }
}

const forgotPassword = async (req, res) => {
    const email = req.body.email;
    const successResponse = { message: 'If a matching account is found, a password reset link has been sent to your email.' };
    try{
        // need to remove this logic, because users should be able to reset their password even if they are logged in
        if (req.cookies?.sessionId) {

            logger.warn({
                errorMessage: `User is already logged in and trying to reset password`,
                endpoint: "/forgot-password",
                status: 400
            })
            return res.status(400).json({ message: "You are already logged in." });
        }
        const user = await userModel.findUserByEmail(email)
        if(!user){

            logger.error({
                errorMessage: `No user found in the given email id`,
                endpoint: "/forgot-password",
                status: 400
            })
            return res.status(401).json({message: `No user found in this email...`})
        }
        const resetString = crypto.randomBytes(32).toString("hex");
        const hashedResetString = await bcrypt.hash(resetString, 10);
        const threeMinute = 3 * 60 * 1000;
        const resetStringExpiryTime = new Date(Date.now()+threeMinute);
        const addedResetString = await userModel.addPasswordResetString(user.user_id, hashedResetString, resetStringExpiryTime)

        if(!addedResetString){

            logger.error({
                errorMessage: `failed to add reset-string for forgot-password`,
                endpoint: "/forgot-password",
                status: 400
            })
            return res.status(400).json({message: `failed to add reset-string for Forgot Password!`})
        }
        const addedPassedReset = await sendPasswordResetEmail(email, resetString);
        if(!addedPassedReset){
            logger.error({
                errorMessage: `reset-token has failed to go to mail`,
                endpoint: "/forgot-password",
                status: 400
            })
            return res.status(400).json({message: `sending reset token to mail failed...`})
        }
        if (process.env.NODE_ENV === 'development') { // Use an environment variable to control this
            logger.info({
                env: `dev`,
                successMessage: `Successfully send reset-password token to mail id`,
                endpoint: "/forgot-password",
                status: 200
            })
            return res.status(200).json({ ...successResponse, resetString: resetString, email: email });
        }else if (process.env.NODE_ENV === 'production'){
            // handle resetString through client side code.
            logger.info({
                env: `prod`,
                successMessage: `Successfully send reset-password token to mail id`,
                endpoint: "/forgot-password",
                status: 200
            })
            return res.status(200).json({message: `Successfully send reset password token to mail id`, email: email})
        }
       

    }catch(error){
        logger.error({
            errorMessage: `Failed to send password reset email`,
            endpoint: "/forgot-password",
            status: 500
        })
        console.error('Password reset request failed:', error);
        return res.status(500).json({ message: 'Failed to send password reset email.' });
    }
}

const resetPassword = async (req, res) => {
    const {newPassword, resetString, email} = req.body;

    try {
        if(!resetString || !newPassword || !email){

            logger.warn({
                errorMessage: "reset password field validation failed",
                reason: "Missing fields",
                endpoint: "/reset-password",
                body: {resetString, email},
                status: 400
            })
            return res.status(400).json({message: `required fields in the body are missing...`})
        }
        
        const resetPasswordUser = await userModel.findUserByEmail(email);
        if(!resetPasswordUser){

            logger.warn({
                errorMessage: `User not found with given email`,
                endpoint: "/reset-password",
                status: 401
            })
            return res.status(401).json({message: `Invalid email or token.`})
        }
        const hashedResetString = resetPasswordUser.reset_password_token;
        const resetStringExpiryTime = resetPasswordUser.reset_password_token_expiry;

        if(resetStringExpiryTime === null || resetStringExpiryTime < new Date()){
            logger.warn({
                errorMessage: `Reset token expired`,
                endpoint: "/reset-password",
                email: email,
                status: 401
            });

            return res.status(401).json({message: `reset password string expired after 3 min...`})
        }
        const isTokenMatch = await bcrypt.compare(resetString, hashedResetString);
        if(!isTokenMatch){
            logger.warn({
                errorMessage: `Reset token does not match hash in database`,
                endpoint: "/reset-password",
                email: email,
                status: 401
            });
            return res.status(400).json({message: `token doesn't match...`})
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const isPasswordReset = await userModel.resetPasswordByEmail(hashedPassword, email);

        if(isPasswordReset.affectedRows > 0){
            logger.info({
                successMessage: `Password reset successful`,
                endpoint: "/reset-password",
                email: email,
                status: 200
            });
            return res.status(200).json({message: `password reset successfull...`})
        }else{
            logger.error({
                errorMessage: `password reset failed after database update call returned no affected rows`,
                endpoint: "/reset-password",
                email: email,
                status: 400
            })
            return res.status(400).json({message: `password reset failed...`})
        }
        
    } catch (error) {
        console.log(error)
        logger.error({
            errorMessage: `An internal server error occurred during password reset`,
            endpoint: "/reset-password",
            status: 500
        });
        return res.status(500).json({message:  `somthing went wrong...`})
    }
}
export { signupUser, signinUser, signoutUser, forgotPassword, resetPassword };


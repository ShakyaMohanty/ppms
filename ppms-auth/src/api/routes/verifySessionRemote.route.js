import Router from 'express';
const router = Router();
import * as userModel from '../models/users.model.js';


router.post('/internal/verify-session', async (req, res) => {
    try{
        let sessionId;
        const headerToken = req.headers['authorization'];
        if(headerToken && headerToken?.startsWith("Bearer")){
                    // console.log(headerToken)
            sessionId = headerToken.split(" ")[1];

            if(!sessionId){
                return res.status(401).json({message: `Session Id not found, You are not authorized!`})
            }
            
            const sessionUser = await userModel.findUserBySessionId(sessionId);
            if(!sessionUser){
                return res.status(404).json({message: `user not found with sessionId`})
            }
            if(sessionUser.session_expiry_time === null || sessionUser.session_expiry_time < new Date()){
                return res.status(403).json({message: `session expired!`})
            }
            req.user = sessionUser;
            return res.status(200).json({
                valid: true,
                user: {
                    user_id: sessionUser.user_id,
                    username: sessionUser.username,
                    role: sessionUser.role
                }
            });
                
        }else{
            return res.status(401).json({ message: `Authorization token missing or malformed` })
        }
        // const cookie = req.headers.cookie;

        // if(cookie){
        //     sessionId = cookie.split("=")[1];
        //     // console.log(sessionId)

        //     if(!sessionId){
        //         return res.status(401).json({message: `Session Id not found, You are not authorized!`})
        //     }
        //     const sessionUser = await userModel.findUserBySessionId(sessionId);
        //     if(!sessionUser){
        //         return res.status(404).json({message: `user not found with sessionId`})
        //     }
        //     if(sessionUser.session_expiry_time === null || sessionUser.session_expiry_time < new Date()){
        //         return res.status(403).json({message: `session expired!`})
        //     }
        //         return res.status(200).json({
        //             valid: true,
        //             user: {
        //                 user_id: sessionUser.user_id,
        //                 username: sessionUser.username,
        //                 role: sessionUser.role
        //             }
        //         });
        //     // return;
        // }else {
        //     return res.status(401).json({message: `Session Id token not found!`})
        // }
    }catch(error){
        console.error('Session verification failed:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

export default router;
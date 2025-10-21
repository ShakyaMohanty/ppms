import * as userModel from '../models/users.model.js'

const verifySession = async (req, res, next) => {
    try{
        let sessionId;
        // const headerToken = req.headers.Authorization || req.headers.authorization;
        const cookie = req.headers.cookie;

        if(cookie){
            sessionId = cookie.split("=")[1];
            // console.log(sessionId)

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
            next();
            // return;
        }else {
            return res.status(401).json({message: `Session Id token not found!`})
        }

        // if(headerToken && headerToken?.startsWith("Bearer")){
        //     // console.log(headerToken)
        //     sessionId = headerToken.split(" ")[1];

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
        //     req.user = sessionUser;
        //     next();
                
        // }else{
        //     return res.status(401).json({ message: `Authorization token missing or malformed` })
        // }
    }catch(error){
        console.error('Session verification failed:', error);
        next(error);
    }
    
    // console.log(sessionId);

}
export {verifySession}
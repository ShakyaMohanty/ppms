import logger from '../services/logger.js';

const checkRole = (roles) => {
    return (req, res, next) => {
        const user = req.user
        if (!user|| !user.role) {
            logger.warn({
                errorMessage: `Forbidden: Not Authenticated or missing role`,
                status: 403
            })
            return res.status(403).json({message: `Forbidden: Not Authenticated or missing role`})
        }
        const requiredRoles = Array.isArray(roles) ? roles : [roles];
        if (!requiredRoles.includes(user.role)){
            logger.warn({
                errorMessage: `Forbidden: Insuficient permission`,
                status: 403
            })
            return res.status(403).json({message: `Forbidden: Insuficient permission`})
        }
        next();
    }
    
}
export{checkRole}
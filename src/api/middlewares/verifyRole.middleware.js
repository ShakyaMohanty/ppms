const checkRole = (roles) => {
    return (req, res, next) => {
        const user = req.user
        if (!user|| !user.role) {
            return res.status(403).json({message: `Forbidden: Not Authenticated or missing role`})
        }
        const requiredRoles = Array.isArray(roles) ? roles : [roles];
        if (!requiredRoles.includes(user.role)){
            return res.status(403).json({message: `Forbidden: Insuficient permission`})
        }
        next();
    }
    
}
export{checkRole}
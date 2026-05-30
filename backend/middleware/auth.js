const jwt = require('jsonwebtoken');

const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];
        const userToken = req.headers['x-user-token'];

        if (!userToken) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        try {
            const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
            if (decodedToken.userRole !== userRole) {
                return res.status(403).json({ error: `you are not ${userRole}!` });
            }
            req.user = decodedToken;
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You do not have permission to perform this action.",
                    details: {
                        requiredRoles: allowedRoles,
                        providedRole: userRole || "none"
                    }
                }
            });
        }
        next();
    };
};


module.exports = authorize;
const jwt = require('jsonwebtoken');
const events = require("../models/eventModel");

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

const validateEventId = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Invalid or expired token.' });
    const eventId = parseInt(req.params.id);
    const event = events.find(event => event.eventId === eventId);
    if (!event){
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "Event not found",
                details: {}
            }
        });
    }
    if (req.user.userRole !== "admin"){
        if (event.creatorId !== req.user.userId){
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You do not have permission to perform this action.",
                    details: 'this event is not listed for this user'
                }
            });
        }
    }
    next();
}

module.exports = {authorize, validateEventId};
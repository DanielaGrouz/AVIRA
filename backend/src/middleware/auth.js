const jwt = require('jsonwebtoken');
const { Event } = require('../../models'); // Import the Sequelize Event model

const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];
        const userToken = req.headers['x-user-token'];

        if (!userToken) {
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Access denied. No token provided.",
                    details: { }
                }
            });
        }
        try {
            const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET || 'your_super_secret_key');
            if (decodedToken.userRole !== userRole) {
                return res.status(403).json({
                    success: false,
                    data: null,
                    error: {
                        code: "FORBIDDEN",
                        message: `you are not ${userRole}!`,
                        details: { }
                    }
                });
            }
            req.user = decodedToken;
        } catch (error) {
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Invalid or expired token.",
                    details: { }
                }
            });
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

// UPDATED FOR ORM: Now async to fetch from the database
const validateEventId = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            data: null,
            error: {
                code: "UNAUTHORIZED",
                message: "Invalid or expired token.",
                details: { }
            }
        });
    }

    const eventId = parseInt(req.params.id);

    try {
        // Query the database for the event
        const event = await Event.findByPk(eventId);

        if (!event) {
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

        // Authorization check: Is the user an admin, or did they create this event?
        if (req.user.userRole !== "admin") {
            if (event.creatorId !== req.user.userId) {
                return res.status(403).json({
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

        // Optional: Attach the event to the request object so downstream controllers
        // don't have to query the database again for the same event
        req.event = event;

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Database error while validating event",
                details: error.message
            }
        });
    }
}

const validateOwnUserId = (req, res, next) => {
    if (!req.user){
        return res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "missing middleware of authorize before this action.",
                details: { }
            }
        });
    }
    const userId = parseInt(req.params.id);
    if (req.user.userRole !== "admin"){
        if (req.user.userId !== userId){
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You do not have permission to perform this action.",
                    details: 'this user is not you'
                }
            });
        }
    }
    next();
}

module.exports = { authorize, validateEventId, validateOwnUserId };
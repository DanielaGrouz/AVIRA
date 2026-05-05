// check permission by user role
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];

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

// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET;
//
// const authenticateJWT = (req, res, next) => {
//     // שליפת הטוקן מה-Header (מקובל להשתמש ב-Authorization: Bearer <token>)
//     const token = req.headers['token'];
//
//     if (token) {
//         jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
//             if (err) {
//                 return res.status(403).json({
//                     success: false,
//                     data: null,
//                     error: {
//                         code: "TOKEN_EXPIRED_OR_INVALID",
//                         message: "Your session has expired or the token is invalid.",
//                         details: err.message
//                     }
//                 });
//             }
//
//             req.user = decodedUser;
//             next();
//         });
//     } else {
//         res.status(401).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "UNAUTHORIZED",
//                 message: "Access denied. No token provided.",
//                 details: {}
//             }
//         });
//     }
// };

module.exports = authorize;
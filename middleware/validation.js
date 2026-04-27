const { VALID_ROLES } = require('../models/constants');

const validateId = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid ID parameter. ID must be a positive number.",
                details: { param: "id", value: req.params.id }
            }
        });
    }
    next();
};

const validateUserFields = (req, res, next) => {
    const { firstName, lastName, userRole } = req.body;
    let errors = [];
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
        errors.push("firstName must be a string (min 2 chars)");
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
        errors.push("lastName must be a string (min 2 chars)");
    }
    if (!userRole || !VALID_ROLES.includes(userRole)) {
        errors.push(`userRole must be one of: ${VALID_ROLES.join(', ')}`);
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid input data",
                details: { errors }
            }
        });
    }
    next();
};

module.exports = {validateId, validateUserFields};
const { BadRequestError } = require('../utils/errors');

const validate = (schema, source = 'body') => (req, res, next) => {
    try {
        // Parse throws an error if validation fails
        // We can validate req.body, req.params, or req.query
        req[source] = schema.parse(req[source]);
        next();
    } catch (error) {
        // Extract all the specific error messages from Zod
        const errors = error.errors.map(err => err.message);

        // Pass to your global error handler
        next(new BadRequestError("Invalid input data", "VALIDATION_ERROR", { errors }));
    }
};

module.exports = validate;
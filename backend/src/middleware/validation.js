const { BadRequestError } = require('../utils/errors');

const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    try {
        const parsedData = schema.parse(req[source]);
        if (!req.validated) {
            req.validated = {};
        }
        req.validated[source] = parsedData;
        next();
    } catch (error) {
      // Extract all the specific error messages from Zod
      const errors = error.errors.map((err) => err.message);

      // Pass to your global error handler
      next(new BadRequestError('Invalid input data', 'VALIDATION_ERROR', { errors }));
    }
  };

module.exports = validate;

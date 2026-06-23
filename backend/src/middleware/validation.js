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
        const cleanMessages = error.errors ? error.errors.map(err => err.message).join(', ') : 'Validation error';
        next(new BadRequestError(cleanMessages, 'VALIDATION_ERROR'));
    }
  };

module.exports = validate;

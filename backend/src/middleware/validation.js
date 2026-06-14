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
      next(new BadRequestError(`Invalid input data ${error.message}`, 'VALIDATION_ERROR'));
    }
  };

module.exports = validate;

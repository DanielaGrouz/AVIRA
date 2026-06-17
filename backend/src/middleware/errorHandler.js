const { BadRequestError, UnauthorizedError } = require('../utils/errors');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  if (err.name === 'ValidationError' || err.name === 'SequelizeValidationError') {
    err = new BadRequestError(err.message, 'VALIDATION_FAILED');
  } else if (err.name === 'JsonWebTokenError') {
    err = new UnauthorizedError('Invalid or expired token', 'INVALID_TOKEN');
  }

  const statusCode = err.statusCode || 500;
  const responseCode = err.code || 'SERVER_ERROR';
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code: responseCode,
      message: message,
      details: err.details || {},
    },
  });
};

module.exports = { errorHandler, asyncHandler };

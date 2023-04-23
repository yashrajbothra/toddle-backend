const httpStatus = require('http-status');

const { ApiError } = require('../utils/error');

const errorConverter = (err, req, res, next) => {
  let error = err;
  // For all Programmatical Errors
  if (!(err instanceof ApiError)) {
    let message = error.message || httpStatus[statusCode];
    let statusCode = error.statusCode
      ? httpStatus.BAD_REQUEST
      : httpStatus.INTERNAL_SERVER_ERROR;
    message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

module.exports = errorConverter;

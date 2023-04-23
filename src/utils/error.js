/* eslint-disable max-classes-per-file */
// We can implement database errors as well for logging all errors efficently. due to time constraint I was not able to do so.
const httpStatus = require('http-status');

class BaseError extends Error {
  constructor(name, statusCode, isOperational, description, stack = '') {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ApiError extends BaseError {
  constructor(
    statusCode = httpStatus.NOT_FOUND,
    description = 'Not found.',
    isOperational = true,
    stack = '',
  ) {
    super('API Error', statusCode, isOperational, description, stack);
  }
}

module.exports = { BaseError, ApiError };

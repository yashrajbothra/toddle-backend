const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  const response = {
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };
  logger.error(err);
  res.status(statusCode).send(response);
};

module.exports = errorHandler;

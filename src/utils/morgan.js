const morgan = require('morgan');
const logger = require('./logger');

morgan.token('message', (req, res) => res.locals.errorMessage || '');

const responseFormat = ':remote-addr :method :url :status - :response-time ms message: :message';

module.exports.successHandler = morgan(responseFormat, {
  skip: (req, res) => res.statusCode >= 500,
  stream: { write: (message) => logger.info(message.trim()) },
});

module.exports.errorHandler = morgan(responseFormat, {
  skip: (req, res) => res.statusCode < 500,
  stream: { write: (message) => logger.error(message.trim()) },
});

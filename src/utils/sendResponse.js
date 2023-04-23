const sendResponse = (res, statusCode, result = {}, message = 'Successfull') => res.status(statusCode).json({
  result,
  message,
});

module.exports = sendResponse;

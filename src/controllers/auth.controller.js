const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');
const { authService } = require('../services');

const login = catchAsync(async (req, res) => {
  const result = await authService.login({ ...req.body });
  sendResponse(res, httpStatus.OK, result, 'User Logged in successfully!');
});

module.exports = {
  login,
};

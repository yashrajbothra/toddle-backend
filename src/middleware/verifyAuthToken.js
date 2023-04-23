const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const { ApiError } = require('../utils/error');
const { userModel } = require('../models');

const verifyAuthToken = async (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        return next(new ApiError(
          httpStatus.FORBIDDEN,
          'Invalid token, try login again',
        ));
      }

      const dbUser = await userModel.getUserById(user.id);
      if (!dbUser) {
        return next(new ApiError(
          httpStatus.UNAUTHORIZED,
          'User not found in the system',
        ));
      }
      req.user = dbUser;
      next();
    });
  } else {
    return next(new ApiError(
      httpStatus.UNAUTHORIZED,
      'Token Not Found',
    ));
  }
};
module.exports = verifyAuthToken;

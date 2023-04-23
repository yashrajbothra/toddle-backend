const bcrypt = require('bcrypt');
const httpStatus = require('http-status');
const { ApiError } = require('../utils/error');
const { userModel } = require('../models')
const jwtUtils = require('../utils/jwtUtils')

const login = async ({
  username, password, role
}) => {
  const user = await userModel.getOrCreateUserByUsername(username, password, role);

  if (!user) {
    throw (new ApiError(
      httpStatus.UNAUTHORIZED,
      'Invalid username or password'
    ))
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw (new ApiError(
      httpStatus.UNAUTHORIZED,
      'Invalid username or password'
    ))
  }

  const token = jwtUtils.generateToken(user);
  delete user.password
  delete user.id

  return { token, user };
};


module.exports = {
  login,
};

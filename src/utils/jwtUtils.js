const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
    };

    const options = {
        expiresIn: process.env.JWT_EXPIRATION || '1h',
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
};

module.exports = {
    generateToken,
};

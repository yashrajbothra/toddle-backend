const bcrypt = require('bcrypt');

const pool = require('../db');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/error');
const httpStatus = require('http-status');

const getOrCreateUserByUsername = async (username, password, role) => {
    try {
        const getUserQuery = `
        SELECT id, username, password, role
        FROM users
        WHERE username = $1;
        `;
        const queryValues = [username];
        const user = await pool.query(getUserQuery, queryValues);
        if (user.rowCount < 1) {
            const addUserQuery = `
            INSERT INTO users (username, password, role)
            VALUES ($1, $2, $3)
            RETURNING id, username, role, password;
            `;
            const encryptedPassword = bcrypt.hashSync(password, 10);
            const queryValues = [username, encryptedPassword, role];

            const result = await pool.query(addUserQuery, queryValues);
            return result.rows[0];
        }
        return user.rows[0];
    } catch (err) {
        logger.error('Error getting user by username:', err);
        return null;
    }
};


const getUserByUsername = async (username) => {
    try {
        const getUserQuery = `
        SELECT id, username, password, role
        FROM users
        WHERE username = $1;
        `;
        const queryValues = [username];
        const user = await pool.query(getUserQuery, queryValues);
        if (user.rowCount < 1) {
            throw new ApiError(httpStatus.NOT_FOUND, "No user found from this username")
        }
        return user.rows[0];
    } catch (err) {
        logger.error('Error getting user by username:', err);
        return null;
    }
};

const getUserById = async (id) => {
    try {
        const getUserQuery = `
        SELECT id, username, password, role
        FROM users
        WHERE id = $1;
        `;
        const queryValues = [id];
        const user = await pool.query(getUserQuery, queryValues);
        if (user.rowCount < 1) {
            throw new ApiError(httpStatus.NOT_FOUND, "No user found from this username")
        }
        return user.rows[0];
    } catch (err) {
        logger.error('Error getting user by username:', err);
        return null;
    }
};

module.exports = {
    getOrCreateUserByUsername, getUserByUsername, getUserById
};

const { Pool } = require('pg');
const logger = require('../utils/logger')
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.connect((err) => {
    if (err) {
        logger.error('Error connecting to the database', err);
    } else {
        logger.debug('Connected to the database');
    }
});

module.exports = pool;

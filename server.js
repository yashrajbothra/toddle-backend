const express = require("express");
const helmet = require('helmet');
const httpStatus = require('http-status');
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();

const { ApiError } = require('./src/utils/error');
const router = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const errorConverter = require('./src/middleware/errorConverter');
const morgan = require('./src/utils/morgan');
const logger = require('./src/utils/logger');

const app = express();
app.use(express.json());
app.use(express.static('static/assets'))
app.use(cors());
app.use(helmet());
app.use(morgan.successHandler);
app.use(morgan.errorHandler);

app.use(process.env.BASE_PATH, router);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Error 404 Not Found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);


const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`Server started on port ${PORT}`);
    });
}

module.exports = app;

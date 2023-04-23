const Joi = require('joi');
const httpStatus = require("http-status");
const { ApiError } = require("../utils/error");

const schemaValidator = (dataPath, schema) => {
    return (req, res, next) => {
        const data = req[dataPath];
        const { error } = schema.validate(data);
        if (error) {
            throw new ApiError(
                httpStatus.UNPROCESSABLE_ENTITY,
                'Invalid request data : ' + error.message
            )
        }
        next();
    }
}

module.exports = schemaValidator
const express = require('express');
const schemaValidator = require('../middleware/schemaValidator');
const { loginSchema } = require('../utils/validationSchema')
const { authController } = require('../controllers');

const router = express.Router();

/**
 *  @route    POST /api/auth/signin
 *  @desc     Creates a new user session
 *  @access   Public
 */
router.post('/signin', schemaValidator('body', loginSchema), authController.login);

module.exports = router;

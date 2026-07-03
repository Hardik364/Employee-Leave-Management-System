/**
 * Validation chains for authentication routes.
 */
const { body } = require('express-validator');

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshRules = [
  body('refreshToken').notEmpty().withMessage('refreshToken is required'),
];

module.exports = { loginRules, refreshRules };

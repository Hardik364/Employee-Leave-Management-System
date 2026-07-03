/**
 * Authentication routes.
 * Base path: /api/auth
 */
const express = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { loginRules, refreshRules } = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', validate(loginRules), controller.login);
router.post('/refresh', validate(refreshRules), controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);

module.exports = router;

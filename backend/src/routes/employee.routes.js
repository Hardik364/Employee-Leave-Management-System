/**
 * Employee directory routes (manager-facing).
 * Base path: /api/employees
 */
const express = require('express');
const controller = require('../controllers/employee.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { idParamRule } = require('../validators/leave.validator');

const router = express.Router();

router.use(authenticate, authorize('manager'));

router.get('/', controller.getEmployees);
router.get('/:id', validate(idParamRule), controller.getEmployeeById);

module.exports = router;

/**
 * Leave routes (employee-facing).
 * Base path: /api/leaves — all routes require authentication.
 */
const express = require('express');
const controller = require('../controllers/leave.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  createLeaveRules,
  updateLeaveRules,
  idParamRule,
  listQueryRules,
} = require('../validators/leave.validator');

const router = express.Router();

router.use(authenticate);

router.get('/stats/summary', controller.getMyStats);
router.post('/', validate(createLeaveRules), controller.createLeave);
router.get('/', validate(listQueryRules), controller.getMyLeaves);
router.get('/:id', validate(idParamRule), controller.getLeaveById);
router.put('/:id', validate(updateLeaveRules), controller.updateLeave);
router.delete('/:id', validate(idParamRule), controller.cancelLeave);

module.exports = router;

/**
 * Manager routes.
 * Base path: /api/manager — all routes require the `manager` role.
 */
const express = require('express');
const controller = require('../controllers/manager.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  idParamRule,
  rejectLeaveRules,
  listQueryRules,
} = require('../validators/leave.validator');

const router = express.Router();

router.use(authenticate, authorize('manager'));

router.get('/stats/summary', controller.getManagerStats);
router.get('/pending-leaves', validate(listQueryRules), controller.getPendingLeaves);
router.get('/leaves', validate(listQueryRules), controller.getAllLeaves);
router.put('/leaves/:id/approve', validate(idParamRule), controller.approveLeave);
router.put('/leaves/:id/reject', validate(rejectLeaveRules), controller.rejectLeave);
router.get('/employees/:id/leaves', validate(idParamRule), controller.getEmployeeLeaves);

module.exports = router;

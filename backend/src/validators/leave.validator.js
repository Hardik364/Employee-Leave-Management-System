/**
 * Validation chains for leave routes.
 */
const { body, param, query } = require('express-validator');
const { Leave } = require('../models');

const createLeaveRules = [
  body('leaveType')
    .isIn(Leave.LEAVE_TYPES)
    .withMessage(`leaveType must be one of: ${Leave.LEAVE_TYPES.join(', ')}`),
  body('startDate').isISO8601().withMessage('startDate must be a valid date (YYYY-MM-DD)'),
  body('endDate')
    .isISO8601()
    .withMessage('endDate must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.body.startDate && value < req.body.startDate) {
        throw new Error('endDate cannot be before startDate');
      }
      return true;
    }),
  body('reason').trim().isLength({ min: 3, max: 500 }).withMessage('reason must be 3-500 characters'),
];

const updateLeaveRules = [
  param('id').isInt().withMessage('Leave id must be an integer'),
  body('leaveType').optional().isIn(Leave.LEAVE_TYPES),
  body('startDate').optional().isISO8601(),
  body('endDate')
    .optional()
    .isISO8601()
    .custom((value, { req }) => {
      if (req.body.startDate && value < req.body.startDate) {
        throw new Error('endDate cannot be before startDate');
      }
      return true;
    }),
  body('reason').optional().trim().isLength({ min: 3, max: 500 }),
];

const rejectLeaveRules = [
  param('id').isInt().withMessage('Leave id must be an integer'),
  body('managerComments')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('managerComments (3-500 chars) are required when rejecting'),
];

const idParamRule = [param('id').isInt().withMessage('Leave id must be an integer')];

const listQueryRules = [
  query('status').optional().isIn(Leave.LEAVE_STATUSES),
  query('leaveType').optional().isIn(Leave.LEAVE_TYPES),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  createLeaveRules,
  updateLeaveRules,
  rejectLeaveRules,
  idParamRule,
  listQueryRules,
};

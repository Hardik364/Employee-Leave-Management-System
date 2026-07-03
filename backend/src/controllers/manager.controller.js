/**
 * Manager controller.
 * Handles pending-request review, approval/rejection workflow,
 * manager dashboard statistics, and viewing any employee's history.
 */
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { Leave, Employee } = require('../models');
const { buildFilters, employeeInclude } = require('./leave.controller');

/**
 * GET /api/manager/pending-leaves
 * List all pending leave requests across employees (with filters + pagination).
 */
const getPendingLeaves = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const where = buildFilters(req.query, { status: 'pending' });

  const { count, rows } = await Leave.findAndCountAll({
    where,
    include: [employeeInclude],
    order: [['createdAt', 'ASC']],
    limit,
    offset,
  });

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  });
});

/**
 * GET /api/manager/leaves
 * List all leave requests (any status) for review, with filters.
 */
const getAllLeaves = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const where = buildFilters(req.query);

  const { count, rows } = await Leave.findAndCountAll({
    where,
    include: [employeeInclude],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  });
});

/** Shared helper to transition a pending leave to approved/rejected. */
const reviewLeave = async (req, status, comments) => {
  const leave = await Leave.findByPk(req.params.id, { include: [employeeInclude] });
  if (!leave) throw ApiError.notFound('Leave request not found');
  if (leave.status !== 'pending') {
    throw ApiError.badRequest(`Only pending requests can be ${status}`);
  }

  leave.status = status;
  leave.reviewedBy = req.user.id;
  if (comments !== undefined) leave.managerComments = comments;
  await leave.save();

  logger.info(`Leave #${leave.id} ${status} by ${req.user.email}`);
  return leave;
};

/**
 * PUT /api/manager/leaves/:id/approve
 */
const approveLeave = asyncHandler(async (req, res) => {
  const leave = await reviewLeave(req, 'approved', req.body.managerComments);
  res.status(200).json({ success: true, message: 'Leave approved', data: leave });
});

/**
 * PUT /api/manager/leaves/:id/reject
 * Requires manager comments explaining the rejection.
 */
const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await reviewLeave(req, 'rejected', req.body.managerComments);
  res.status(200).json({ success: true, message: 'Leave rejected', data: leave });
});

/**
 * GET /api/manager/employees/:id/leaves
 * View a specific employee's leave history.
 */
const getEmployeeLeaves = asyncHandler(async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);
  if (!employee) throw ApiError.notFound('Employee not found');

  const where = buildFilters(req.query, { employeeId: employee.id });
  const leaves = await Leave.findAll({ where, order: [['createdAt', 'DESC']] });

  res.status(200).json({
    success: true,
    data: { employee: employee.toJSON(), leaves },
  });
});

/**
 * GET /api/manager/stats/summary
 * Manager dashboard: team totals and recent activity.
 */
const getManagerStats = asyncHandler(async (req, res) => {
  const [totalEmployees, pending, approved, rejected, cancelled, recent] = await Promise.all([
    Employee.count({ where: { role: 'employee' } }),
    Leave.count({ where: { status: 'pending' } }),
    Leave.count({ where: { status: 'approved' } }),
    Leave.count({ where: { status: 'rejected' } }),
    Leave.count({ where: { status: 'cancelled' } }),
    Leave.findAll({ include: [employeeInclude], order: [['updatedAt', 'DESC']], limit: 5 }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totals: { totalEmployees, pending, approved, rejected, cancelled },
      recent,
    },
  });
});

module.exports = {
  getPendingLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  getEmployeeLeaves,
  getManagerStats,
};

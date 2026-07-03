/**
 * Leave controller (employee-facing).
 * Handles applying for leave, viewing/searching/filtering history,
 * editing and cancelling pending requests, and dashboard statistics.
 */
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { Leave, Employee } = require('../models');

const employeeInclude = {
  model: Employee,
  as: 'employee',
  attributes: ['id', 'name', 'email', 'department', 'role'],
};

/** Build a WHERE clause from query params (status, type, search). */
const buildFilters = (query, baseWhere = {}) => {
  const where = { ...baseWhere };
  if (query.status) where.status = query.status;
  if (query.leaveType) where.leaveType = query.leaveType;
  if (query.search) {
    where.reason = { [Op.like]: `%${query.search}%` };
  }
  return where;
};

/**
 * POST /api/leaves
 * Create a new leave request for the authenticated employee.
 */
const createLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  const leave = await Leave.create({
    employeeId: req.user.id,
    leaveType,
    startDate,
    endDate,
    reason,
    status: 'pending',
  });

  logger.info(`Leave #${leave.id} created by ${req.user.email}`);
  res.status(201).json({ success: true, message: 'Leave request submitted', data: leave });
});

/**
 * GET /api/leaves
 * List the authenticated employee's leave requests with search,
 * filtering, and pagination.
 */
const getMyLeaves = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const where = buildFilters(req.query, { employeeId: req.user.id });

  const { count, rows } = await Leave.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
});

/**
 * GET /api/leaves/:id
 * Fetch a single leave request. Employees may only view their own.
 */
const getLeaveById = asyncHandler(async (req, res) => {
  const leave = await Leave.findByPk(req.params.id, { include: [employeeInclude] });
  if (!leave) throw ApiError.notFound('Leave request not found');

  if (req.user.role !== 'manager' && leave.employeeId !== req.user.id) {
    throw ApiError.forbidden('You can only view your own leave requests');
  }

  res.status(200).json({ success: true, data: leave });
});

/**
 * PUT /api/leaves/:id
 * Edit a pending leave request owned by the authenticated employee.
 */
const updateLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findByPk(req.params.id);
  if (!leave) throw ApiError.notFound('Leave request not found');

  if (leave.employeeId !== req.user.id) {
    throw ApiError.forbidden('You can only edit your own leave requests');
  }
  if (leave.status !== 'pending') {
    throw ApiError.badRequest('Only pending leave requests can be edited');
  }

  const fields = ['leaveType', 'startDate', 'endDate', 'reason'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) leave[f] = req.body[f];
  });
  await leave.save();

  logger.info(`Leave #${leave.id} updated by ${req.user.email}`);
  res.status(200).json({ success: true, message: 'Leave request updated', data: leave });
});

/**
 * DELETE /api/leaves/:id
 * Cancel a pending leave request (soft transition to `cancelled`).
 */
const cancelLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findByPk(req.params.id);
  if (!leave) throw ApiError.notFound('Leave request not found');

  if (leave.employeeId !== req.user.id) {
    throw ApiError.forbidden('You can only cancel your own leave requests');
  }
  if (leave.status !== 'pending') {
    throw ApiError.badRequest('Only pending leave requests can be cancelled');
  }

  leave.status = 'cancelled';
  await leave.save();

  logger.info(`Leave #${leave.id} cancelled by ${req.user.email}`);
  res.status(200).json({ success: true, message: 'Leave request cancelled', data: leave });
});

/**
 * GET /api/leaves/stats/summary
 * Dashboard summary for the authenticated employee.
 */
const getMyStats = asyncHandler(async (req, res) => {
  const where = { employeeId: req.user.id };
  const [total, approved, pending, rejected, cancelled, recent] = await Promise.all([
    Leave.count({ where }),
    Leave.count({ where: { ...where, status: 'approved' } }),
    Leave.count({ where: { ...where, status: 'pending' } }),
    Leave.count({ where: { ...where, status: 'rejected' } }),
    Leave.count({ where: { ...where, status: 'cancelled' } }),
    Leave.findAll({ where, order: [['createdAt', 'DESC']], limit: 5 }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totals: { total, approved, pending, rejected, cancelled },
      recent,
    },
  });
});

module.exports = {
  createLeave,
  getMyLeaves,
  getLeaveById,
  updateLeave,
  cancelLeave,
  getMyStats,
  buildFilters,
  employeeInclude,
};

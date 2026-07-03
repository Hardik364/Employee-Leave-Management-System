/**
 * Employee directory controller (manager-facing).
 * Lists and searches employees.
 */
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { Employee } = require('../models');

/**
 * GET /api/employees
 * List employees with optional name/email search and pagination.
 */
const getEmployees = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${req.query.search}%` } },
      { email: { [Op.like]: `%${req.query.search}%` } },
    ];
  }
  if (req.query.department) where.department = req.query.department;

  const { count, rows } = await Employee.findAndCountAll({
    where,
    order: [['name', 'ASC']],
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
 * GET /api/employees/:id
 * Fetch a single employee's profile.
 */
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);
  if (!employee) throw ApiError.notFound('Employee not found');
  res.status(200).json({ success: true, data: employee });
});

module.exports = { getEmployees, getEmployeeById };

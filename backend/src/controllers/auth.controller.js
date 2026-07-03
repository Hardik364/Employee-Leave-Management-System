/**
 * Authentication controller: login, logout, refresh, and current-user.
 */
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { Employee } = require('../models');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/token');

/**
 * POST /api/auth/login
 * Authenticate with email + password and return JWT tokens.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const employee = await Employee.findOne({ where: { email } });
  if (!employee || !(await employee.validatePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = signAccessToken(employee);
  const refreshToken = signRefreshToken(employee);

  logger.info(`User logged in: ${employee.email} (${employee.role})`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: employee.toJSON(),
      accessToken,
      refreshToken,
    },
  });
});

/**
 * POST /api/auth/refresh
 * Exchange a valid refresh token for a new access token.
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const employee = await Employee.findByPk(decoded.sub);
  if (!employee) {
    throw ApiError.unauthorized('User no longer exists');
  }

  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: {
      accessToken: signAccessToken(employee),
      refreshToken: signRefreshToken(employee),
    },
  });
});

/**
 * POST /api/auth/logout
 * Stateless JWT logout — the client discards its tokens.
 */
const logout = asyncHandler(async (req, res) => {
  logger.info(`User logged out: ${req.user.email}`);
  res.status(200).json({ success: true, message: 'Logout successful' });
});

/**
 * GET /api/auth/me
 * Return the currently authenticated user.
 */
const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user.toJSON() } });
});

module.exports = { login, refresh, logout, me };

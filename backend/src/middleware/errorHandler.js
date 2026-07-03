/**
 * Central error-handling middleware and 404 handler.
 * Converts known error types into consistent JSON responses and logs
 * unexpected failures.
 */
const { ValidationError, UniqueConstraintError } = require('sequelize');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details;

  // Normalize Sequelize validation / unique errors.
  if (err instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'A record with the provided value already exists';
    details = err.errors?.map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.errors?.map((e) => ({ field: e.path, message: e.message }));
  }

  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`${statusCode} ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFoundHandler };

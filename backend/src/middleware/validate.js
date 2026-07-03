/**
 * Runs express-validator chains and aggregates any validation errors
 * into a single 400 response.
 */
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));

  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const details = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  return next(ApiError.badRequest('Validation failed', details));
};

module.exports = validate;

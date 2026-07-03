/**
 * Authentication & authorization middleware.
 *  - `authenticate` verifies the Bearer access token and loads the user.
 *  - `authorize(...roles)` restricts a route to specific roles (RBAC).
 */
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/token');
const { Employee } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Missing or malformed Authorization header');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const employee = await Employee.findByPk(decoded.sub);
    if (!employee) {
      throw ApiError.unauthorized('User no longer exists');
    }

    req.user = employee;
    next();
  } catch (err) {
    next(err);
  }
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };

module.exports = { authenticate, authorize };

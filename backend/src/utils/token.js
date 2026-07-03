/**
 * JWT helpers for issuing and verifying access and refresh tokens.
 */
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const buildPayload = (employee) => ({
  sub: employee.id,
  email: employee.email,
  role: employee.role,
});

const signAccessToken = (employee) =>
  jwt.sign(buildPayload(employee), config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

const signRefreshToken = (employee) =>
  jwt.sign({ sub: employee.id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

const verifyAccessToken = (token) => jwt.verify(token, config.jwt.secret);

const verifyRefreshToken = (token) => jwt.verify(token, config.jwt.refreshSecret);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

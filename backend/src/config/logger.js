/**
 * Application logger built on Winston.
 * Writes human-readable logs to the console and persists errors/combined
 * logs to files under backend/logs.
 */
const path = require('path');
const fs = require('fs');
const winston = require('winston');
const config = require('./env');

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), consoleFormat),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: winston.format.json(),
    }),
  ],
  exitOnError: false,
});

// A stream so morgan can pipe HTTP logs through winston.
logger.stream = {
  write: (message) => logger.http?.(message.trim()) || logger.info(message.trim()),
};

module.exports = logger;

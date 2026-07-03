/**
 * Sequelize database connection.
 * Supports SQLite (default, zero-config) and PostgreSQL, selected via
 * the DB_DIALECT environment variable.
 */
const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
const config = require('./env');
const logger = require('./logger');

let sequelize;

if (config.db.dialect === 'sqlite') {
  // `:memory:` runs an ephemeral in-memory database (used in tests).
  const isMemory = config.db.storage === ':memory:';
  let storagePath = config.db.storage;

  if (!isMemory) {
    storagePath = path.resolve(__dirname, '../../', config.db.storage);
    const dir = path.dirname(storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: config.env === 'test' ? false : (msg) => logger.debug(msg),
  });
} else {
  sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: (msg) => logger.debug(msg),
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  });
}

/**
 * Verify the database connection is reachable.
 */
async function connectDatabase() {
  await sequelize.authenticate();
  logger.info(`Database connected (${config.db.dialect})`);
}

module.exports = { sequelize, connectDatabase };

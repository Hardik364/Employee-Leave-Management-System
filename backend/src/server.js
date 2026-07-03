/**
 * Server entry point.
 * Connects to the database, syncs models, and starts the HTTP server.
 */
const app = require('./app');
const config = require('./config/env');
const logger = require('./config/logger');
const { sequelize, connectDatabase } = require('./config/database');
require('./models'); // register models & associations

async function start() {
  try {
    await connectDatabase();
    await sequelize.sync();
    logger.info('Models synchronized');

    app.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port} (${config.env})`);
      logger.info(`API docs available at http://localhost:${config.port}/api/docs`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

start();

/**
 * Database seed script.
 * Creates tables and inserts sample managers, employees, and leave
 * requests so the application is usable immediately after setup.
 *
 * Usage: npm run seed
 */
const { sequelize, Employee, Leave } = require('../models');
const config = require('../config/env');
const logger = require('../config/logger');

const PASSWORD = config.seed.defaultPassword;

async function seed() {
  try {
    await sequelize.sync({ force: true });
    logger.info('Tables recreated');

    const [manager, alice, bob, carol] = await Promise.all([
      Employee.create({
        name: 'Alice Manager',
        email: 'manager@company.com',
        password: PASSWORD,
        department: 'Engineering',
        role: 'manager',
      }),
      Employee.create({
        name: 'Bob Employee',
        email: 'employee@company.com',
        password: PASSWORD,
        department: 'Engineering',
        role: 'employee',
      }),
      Employee.create({
        name: 'Carol Singh',
        email: 'carol@company.com',
        password: PASSWORD,
        department: 'Design',
        role: 'employee',
      }),
      Employee.create({
        name: 'David Lee',
        email: 'david@company.com',
        password: PASSWORD,
        department: 'Sales',
        role: 'employee',
      }),
    ]);

    await Leave.bulkCreate([
      {
        employeeId: alice.id,
        leaveType: 'casual',
        startDate: '2026-07-10',
        endDate: '2026-07-11',
        reason: 'Personal errand',
        status: 'pending',
      },
      {
        employeeId: alice.id,
        leaveType: 'sick',
        startDate: '2026-06-20',
        endDate: '2026-06-21',
        reason: 'Fever',
        status: 'approved',
        reviewedBy: manager.id,
        managerComments: 'Get well soon',
      },
      {
        employeeId: bob.id,
        leaveType: 'earned',
        startDate: '2026-08-01',
        endDate: '2026-08-05',
        reason: 'Vacation',
        status: 'pending',
      },
      {
        employeeId: carol.id,
        leaveType: 'unpaid',
        startDate: '2026-05-15',
        endDate: '2026-05-16',
        reason: 'Travel',
        status: 'rejected',
        reviewedBy: manager.id,
        managerComments: 'Insufficient balance for this period',
      },
    ]);

    logger.info('Seed data inserted successfully');
    logger.info(`Sample login -> manager@company.com / ${PASSWORD}`);
    logger.info(`Sample login -> employee@company.com / ${PASSWORD}`);
    process.exit(0);
  } catch (err) {
    logger.error(`Seed failed: ${err.stack || err.message}`);
    process.exit(1);
  }
}

seed();

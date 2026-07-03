/**
 * Model registry.
 * Initializes every model against the shared Sequelize instance and
 * wires up associations between them.
 */
const { sequelize } = require('../config/database');

const Employee = require('./Employee')(sequelize);
const Leave = require('./Leave')(sequelize);

// Associations: one Employee has many Leaves.
Employee.hasMany(Leave, {
  foreignKey: { name: 'employeeId', field: 'employee_id', allowNull: false },
  as: 'leaves',
  onDelete: 'CASCADE',
});
Leave.belongsTo(Employee, {
  foreignKey: { name: 'employeeId', field: 'employee_id', allowNull: false },
  as: 'employee',
});

// A Leave is reviewed by a Manager (self-reference to employees table).
Leave.belongsTo(Employee, {
  foreignKey: { name: 'reviewedBy', field: 'reviewed_by', allowNull: true },
  as: 'reviewer',
});

const db = { sequelize, Employee, Leave };

module.exports = db;

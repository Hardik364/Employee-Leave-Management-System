/**
 * Employee model.
 * Represents both Employees and Managers, distinguished by `role`.
 * Passwords are stored hashed (see hooks) and never returned in JSON.
 */
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const config = require('../config/env');

const ROLES = ['employee', 'manager'];

module.exports = (sequelize) => {
  class Employee extends Model {
    /** Compare a plaintext password against the stored hash. */
    async validatePassword(plain) {
      return bcrypt.compare(plain, this.password);
    }

    /** Never expose the password hash in serialized output. */
    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      return values;
    }
  }

  Employee.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true, len: [2, 100] },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true, notEmpty: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'General',
      },
      role: {
        type: DataTypes.ENUM(...ROLES),
        allowNull: false,
        defaultValue: 'employee',
      },
    },
    {
      sequelize,
      modelName: 'Employee',
      tableName: 'employees',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['email'] },
        { fields: ['role'] },
      ],
      hooks: {
        beforeSave: async (employee) => {
          if (employee.changed('password')) {
            const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
            employee.password = await bcrypt.hash(employee.password, salt);
          }
        },
      },
    }
  );

  Employee.ROLES = ROLES;
  return Employee;
};

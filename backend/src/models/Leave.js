/**
 * Leave model.
 * A leave request belongs to an Employee. Status transitions are:
 *   pending -> approved | rejected | cancelled
 */
const { DataTypes, Model } = require('sequelize');

const LEAVE_TYPES = ['casual', 'sick', 'earned', 'unpaid', 'maternity', 'paternity'];
const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

module.exports = (sequelize) => {
  class Leave extends Model {}

  Leave.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'employee_id',
      },
      leaveType: {
        type: DataTypes.ENUM(...LEAVE_TYPES),
        allowNull: false,
        field: 'leave_type',
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'start_date',
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'end_date',
      },
      reason: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: { notEmpty: true, len: [3, 500] },
      },
      status: {
        type: DataTypes.ENUM(...LEAVE_STATUSES),
        allowNull: false,
        defaultValue: 'pending',
      },
      managerComments: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'manager_comments',
      },
      reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reviewed_by',
      },
    },
    {
      sequelize,
      modelName: 'Leave',
      tableName: 'leaves',
      timestamps: true,
      indexes: [
        { fields: ['employee_id'] },
        { fields: ['status'] },
        { fields: ['leave_type'] },
      ],
      validate: {
        endNotBeforeStart() {
          if (this.startDate && this.endDate && this.endDate < this.startDate) {
            throw new Error('endDate cannot be before startDate');
          }
        },
      },
    }
  );

  Leave.LEAVE_TYPES = LEAVE_TYPES;
  Leave.LEAVE_STATUSES = LEAVE_STATUSES;
  return Leave;
};

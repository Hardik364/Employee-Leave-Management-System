/**
 * Swagger/OpenAPI configuration. Serves interactive docs at /api/docs.
 */
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Leave Management System API',
      version: '1.0.0',
      description:
        'REST API for submitting, tracking, and approving employee leave requests. ' +
        'Authenticate via /api/auth/login and pass the returned accessToken as a Bearer token.',
    },
    servers: [{ url: `http://localhost:${config.port}`, description: 'Local server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Alice Manager' },
            email: { type: 'string', example: 'manager@company.com' },
            department: { type: 'string', example: 'Engineering' },
            role: { type: 'string', enum: ['employee', 'manager'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Leave: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 10 },
            employeeId: { type: 'integer', example: 2 },
            leaveType: {
              type: 'string',
              enum: ['casual', 'sick', 'earned', 'unpaid', 'maternity', 'paternity'],
            },
            startDate: { type: 'string', format: 'date', example: '2026-07-10' },
            endDate: { type: 'string', format: 'date', example: '2026-07-12' },
            reason: { type: 'string', example: 'Family function' },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'cancelled'],
            },
            managerComments: { type: 'string', nullable: true },
            reviewedBy: { type: 'integer', nullable: true },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/docs/*.js'],
};

module.exports = swaggerJsdoc(options);

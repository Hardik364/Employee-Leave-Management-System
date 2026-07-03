/**
 * OpenAPI path definitions (JSDoc @swagger blocks).
 * Kept separate from route files to keep controllers/routes lean.
 */

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication & session
 *   - name: Leaves
 *     description: Employee leave requests
 *   - name: Manager
 *     description: Manager review & approval operations
 *   - name: Employees
 *     description: Employee directory (manager only)
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: manager@company.com }
 *               password: { type: string, example: Password123! }
 *     responses:
 *       200:
 *         description: Login successful (returns user + tokens)
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: New tokens issued }
 *       401: { description: Invalid or expired refresh token }
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out (stateless — client discards tokens)
 *     responses:
 *       200: { description: Logout successful }
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently authenticated user
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Unauthorized }
 */

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     tags: [Leaves]
 *     summary: Apply for leave
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [leaveType, startDate, endDate, reason]
 *             properties:
 *               leaveType: { type: string, enum: [casual, sick, earned, unpaid, maternity, paternity] }
 *               startDate: { type: string, format: date, example: 2026-07-10 }
 *               endDate: { type: string, format: date, example: 2026-07-12 }
 *               reason: { type: string, example: Family function }
 *     responses:
 *       201: { description: Leave request created }
 *       400: { description: Validation failed }
 *   get:
 *     tags: [Leaves]
 *     summary: List my leave requests (search, filter, paginate)
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [pending, approved, rejected, cancelled] } }
 *       - { in: query, name: leaveType, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Paginated list of leaves }
 */

/**
 * @swagger
 * /api/leaves/{id}:
 *   get:
 *     tags: [Leaves]
 *     summary: Get a leave request by id
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Leave request }
 *       404: { description: Not found }
 *   put:
 *     tags: [Leaves]
 *     summary: Edit a pending leave request
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Only pending requests can be edited }
 *   delete:
 *     tags: [Leaves]
 *     summary: Cancel a pending leave request
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Cancelled }
 * /api/leaves/stats/summary:
 *   get:
 *     tags: [Leaves]
 *     summary: Employee dashboard statistics
 *     responses:
 *       200: { description: Totals and recent activity }
 */

/**
 * @swagger
 * /api/manager/pending-leaves:
 *   get:
 *     tags: [Manager]
 *     summary: List all pending leave requests
 *     responses:
 *       200: { description: Paginated pending requests }
 *       403: { description: Manager role required }
 * /api/manager/leaves/{id}/approve:
 *   put:
 *     tags: [Manager]
 *     summary: Approve a leave request
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { managerComments: { type: string } }
 *     responses:
 *       200: { description: Approved }
 * /api/manager/leaves/{id}/reject:
 *   put:
 *     tags: [Manager]
 *     summary: Reject a leave request (comments required)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [managerComments]
 *             properties: { managerComments: { type: string, example: Insufficient balance } }
 *     responses:
 *       200: { description: Rejected }
 *       400: { description: Comments required }
 * /api/manager/stats/summary:
 *   get:
 *     tags: [Manager]
 *     summary: Manager dashboard statistics
 *     responses:
 *       200: { description: Team totals and recent activity }
 * /api/manager/employees/{id}/leaves:
 *   get:
 *     tags: [Manager]
 *     summary: View a specific employee's leave history
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Employee and their leaves }
 */

/**
 * @swagger
 * /api/employees:
 *   get:
 *     tags: [Employees]
 *     summary: List/search employees (manager only)
 *     parameters:
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: department, schema: { type: string } }
 *     responses:
 *       200: { description: Paginated employees }
 * /api/employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Get an employee by id (manager only)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Employee }
 *       404: { description: Not found }
 */

module.exports = {};

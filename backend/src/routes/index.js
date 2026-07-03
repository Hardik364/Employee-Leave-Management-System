/**
 * API route aggregator. Mounts all feature routers under /api.
 */
const express = require('express');
const authRoutes = require('./auth.routes');
const leaveRoutes = require('./leave.routes');
const managerRoutes = require('./manager.routes');
const employeeRoutes = require('./employee.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/leaves', leaveRoutes);
router.use('/manager', managerRoutes);
router.use('/employees', employeeRoutes);

module.exports = router;

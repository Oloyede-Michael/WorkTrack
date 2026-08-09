const express = require('express');
const { getDashboardStats, getAttendanceBoard, overrideAttendance } = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/attendance-board', getAttendanceBoard);
router.post('/override', overrideAttendance);

module.exports = router;

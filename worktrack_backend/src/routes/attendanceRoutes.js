const express = require('express');
const { getToday, checkIn, checkOut, getHistory } = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/today', getToday);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/history', getHistory);
router.get('/history/:staffId', getHistory);

module.exports = router;

const express = require('express');
const {
  departmentAnalytics, staffRanking, exportCsv, exportPdf,
} = require('../controllers/reportController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/department-analytics', departmentAnalytics);
router.get('/staff-ranking', staffRanking);
router.get('/export/csv', exportCsv);
router.get('/export/pdf', exportPdf);

module.exports = router;

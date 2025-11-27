const express = require('express');
const router = express.Router();
const { getSalesReport } = require('../controllers/reportController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Báo cáo doanh số, top món bán chạy
// GET /api/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/sales', protect, isAdmin, getSalesReport);

module.exports = router;

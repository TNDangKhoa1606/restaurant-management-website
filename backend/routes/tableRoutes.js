const express = require('express');
const router = express.Router();
const { getFloorLayouts, createTable, updateTable, deleteTable, mergeTables } = require('../controllers/tableController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/floors').get(protect, getFloorLayouts);
router.route('/').post(protect, isAdmin, createTable);
router.route('/merge').post(protect, isAdmin, mergeTables);
router.route('/:id')
    .put(protect, isAdmin, updateTable)
    .delete(protect, isAdmin, deleteTable);

module.exports = router;
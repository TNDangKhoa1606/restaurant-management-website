const express = require('express');
const router = express.Router();
const { 
    getIngredients, 
    addIngredient, 
    updateIngredient, 
    deleteIngredient,
    getDishes,
    addDish,
    updateDish,
    deleteDish,
    getSupplies,
    addSupply,
    updateSupply,
    deleteSupply
} = require('../controllers/inventoryController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Tất cả các route trong file này đều yêu cầu đăng nhập và quyền Admin
router.use(protect);
router.use(isAdmin);

// === INGREDIENTS ===
router.route('/ingredients')
    .get(getIngredients)
    .post(addIngredient);

router.route('/ingredients/:ingredient_id')
    .put(updateIngredient)
    .delete(deleteIngredient);

// === DISHES ===
router.route('/dishes')
    .get(getDishes)
    .post(upload.single('image'), addDish);

router.route('/dishes/:dish_id')
    .put(upload.single('image'), updateDish)
    .delete(deleteDish);

// === SUPPLIES ===
router.route('/supplies')
    .get(getSupplies)
    .post(addSupply);

router.route('/supplies/:supply_id')
    .put(updateSupply)
    .delete(deleteSupply);

module.exports = router;

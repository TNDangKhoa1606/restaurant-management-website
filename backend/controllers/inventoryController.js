const db = require('../config/db');

// Lấy danh sách tất cả nguyên liệu
const getIngredients = async (req, res) => {
    try {
        const [ingredients] = await db.query('SELECT * FROM ingredients ORDER BY name ASC');
        res.json(ingredients);
    } catch (error) {
        console.error('Get ingredients error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách nguyên liệu.' });
    }
};

// Lấy danh sách tất cả món ăn (cho quản lý kho)
const getDishes = async (req, res) => {
    try {
        const query = `
            SELECT d.dish_id, d.name, d.price, d.image_url, d.status, c.name as category_name
            FROM dishes d
            LEFT JOIN categories c ON d.category_id = c.category_id
            ORDER BY d.name ASC
        `;
        const [dishes] = await db.query(query);
        res.json(dishes);
    } catch (error) {
        console.error('Get dishes for inventory error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách món ăn.' });
    }
};

// Lấy danh sách tất cả vật tư
const getSupplies = async (req, res) => {
    try {
        const [supplies] = await db.query('SELECT * FROM supplies ORDER BY name ASC');
        res.json(supplies);
    } catch (error) {
        console.error('Get supplies error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách vật tư.' });
    }
};

// Thêm một nguyên liệu mới
const addIngredient = async (req, res) => {
    const { name, stock_quantity, unit, warning_level } = req.body;

    // --- Validation cơ bản ---
    if (!name || !unit) {
        return res.status(400).json({ message: 'Tên nguyên liệu và đơn vị không được để trống.' });
    }
    if (isNaN(parseFloat(stock_quantity)) || isNaN(parseFloat(warning_level))) {
        return res.status(400).json({ message: 'Số lượng tồn và mức cảnh báo phải là số.' });
    }
    // --- Kết thúc Validation ---

    try {
        const sql = `
            INSERT INTO ingredients (name, stock_quantity, unit, warning_level)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(sql, [name, parseFloat(stock_quantity), unit, parseFloat(warning_level)]);

        // Lấy lại dữ liệu vừa insert để trả về cho client
        const [newIngredient] = await db.query('SELECT * FROM ingredients WHERE ingredient_id = ?', [result.insertId]);

        res.status(201).json(newIngredient[0]);
    } catch (error) {
        console.error('Add ingredient error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi thêm nguyên liệu.' });
    }
};

// Cập nhật một nguyên liệu
const updateIngredient = async (req, res) => {
    const { ingredient_id } = req.params;
    const { name, stock_quantity, unit, warning_level } = req.body;

    if (!name || !unit) {
        return res.status(400).json({ message: 'Tên nguyên liệu và đơn vị không được để trống.' });
    }
    if (isNaN(parseFloat(stock_quantity)) || isNaN(parseFloat(warning_level))) {
        return res.status(400).json({ message: 'Số lượng tồn và mức cảnh báo phải là số.' });
    }

    try {
        const sql = `
            UPDATE ingredients
            SET name = ?, stock_quantity = ?, unit = ?, warning_level = ?
            WHERE ingredient_id = ?
        `;
        await db.query(sql, [name, parseFloat(stock_quantity), unit, parseFloat(warning_level), ingredient_id]);
        res.json({ message: 'Cập nhật nguyên liệu thành công.' });
    } catch (error) {
        console.error('Update ingredient error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật nguyên liệu.' });
    }
};

// Xóa một nguyên liệu
const deleteIngredient = async (req, res) => {
    const { ingredient_id } = req.params;
    try {
        // Optional: Check if the ingredient is being used in any dishingredient before deleting
        const [inUse] = await db.query('SELECT * FROM dishingredient WHERE ingredient_id = ?', [ingredient_id]);
        if (inUse.length > 0) {
            return res.status(400).json({ message: 'Không thể xóa nguyên liệu đang được sử dụng trong một món ăn.' });
        }

        const [result] = await db.query('DELETE FROM ingredients WHERE ingredient_id = ?', [ingredient_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy nguyên liệu để xóa.' });
        }

        res.json({ message: 'Xóa nguyên liệu thành công.' });
    } catch (error) {
        console.error('Delete ingredient error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi xóa nguyên liệu.' });
    }
};

// Thêm một vật tư mới
const addSupply = async (req, res) => {
    const { name, stock_quantity, unit, type } = req.body;
    if (!name || !unit || !type) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: tên, đơn vị, và loại vật tư.' });
    }
    if (isNaN(parseFloat(stock_quantity))) {
        return res.status(400).json({ message: 'Số lượng tồn phải là một số.' });
    }

    try {
        const sql = `INSERT INTO supplies (name, stock_quantity, unit, type) VALUES (?, ?, ?, ?)`;
        const [result] = await db.query(sql, [name, parseFloat(stock_quantity), unit, type]);
        const [newSupply] = await db.query('SELECT * FROM supplies WHERE supply_id = ?', [result.insertId]);
        res.status(201).json(newSupply[0]);
    } catch (error) {
        console.error('Add supply error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi thêm vật tư.' });
    }
};

// Cập nhật một vật tư
const updateSupply = async (req, res) => {
    const { supply_id } = req.params;
    const { name, stock_quantity, unit, type } = req.body;
    if (!name || !unit || !type) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: tên, đơn vị, và loại vật tư.' });
    }
    if (isNaN(parseFloat(stock_quantity))) {
        return res.status(400).json({ message: 'Số lượng tồn phải là một số.' });
    }

    try {
        const sql = `
            UPDATE supplies
            SET name = ?, stock_quantity = ?, unit = ?, type = ?
            WHERE supply_id = ?
        `;
        await db.query(sql, [name, parseFloat(stock_quantity), unit, type, supply_id]);
        res.json({ message: 'Cập nhật vật tư thành công.' });
    } catch (error) {
        console.error('Update supply error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật vật tư.' });
    }
};

// Xóa một vật tư
const deleteSupply = async (req, res) => {
    const { supply_id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM supplies WHERE supply_id = ?', [supply_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy vật tư để xóa.' });
        }
        res.json({ message: 'Xóa vật tư thành công.' });
    } catch (error) {
        console.error('Delete supply error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi xóa vật tư.' });
    }
};

// === DISHES CONTROLLERS ===

// Thêm một món ăn mới
const addDish = async (req, res) => {
    const { name, price, category_id, status } = req.body;
    // Lấy đường dẫn file nếu có, nếu không thì lấy image_url từ body (cho trường hợp dùng URL)
    const image_url = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : req.body.image_url;

    if (!name || !category_id || !status) {
        return res.status(400).json({ message: 'Tên, danh mục và trạng thái là bắt buộc.' });
    }
    if (isNaN(parseFloat(price))) {
        return res.status(400).json({ message: 'Giá phải là một số.' });
    }

    try {
        const sql = `
            INSERT INTO dishes (name, price, category_id, image_url, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(sql, [name, parseFloat(price), category_id, image_url, status]);
        const [newDish] = await db.query('SELECT * FROM dishes WHERE dish_id = ?', [result.insertId]);
        res.status(201).json(newDish[0]);
    } catch (error) {
        console.error('Add dish error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi thêm món ăn.' });
    }
};

// Cập nhật một món ăn
const updateDish = async (req, res) => {
    const { dish_id } = req.params;
    const { name, price, category_id, status } = req.body;
    // Nếu có file mới tải lên, dùng đường dẫn của nó.
    // Nếu không, dùng lại image_url cũ từ body.
    const image_url = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : req.body.image_url;

    if (!name || !category_id || !status) {
        return res.status(400).json({ message: 'Tên, danh mục và trạng thái là bắt buộc.' });
    }
    if (isNaN(parseFloat(price))) {
        return res.status(400).json({ message: 'Giá phải là một số.' });
    }

    try {
        const sql = `
            UPDATE dishes
            SET name = ?, price = ?, category_id = ?, image_url = ?, status = ?
            WHERE dish_id = ?
        `;
        await db.query(sql, [name, parseFloat(price), category_id, image_url, status, dish_id]);
        res.json({ message: 'Cập nhật món ăn thành công.' });
    } catch (error) {
        console.error('Update dish error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật món ăn.' });
    }
};

// Xóa một món ăn
const deleteDish = async (req, res) => {
    const { dish_id } = req.params;
    try {
        // Optional: Check dependencies before deleting
        await db.query('DELETE FROM dishingredient WHERE dish_id = ?', [dish_id]);
        const [result] = await db.query('DELETE FROM dishes WHERE dish_id = ?', [dish_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy món ăn để xóa.' });
        }

        res.json({ message: 'Xóa món ăn thành công.' });
    } catch (error) {
        console.error('Delete dish error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi xóa món ăn.' });
    }
};


module.exports = {
    getIngredients,
    getDishes,
    getSupplies,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addSupply,
    updateSupply,
    deleteSupply,
    addDish,
    updateDish,
    deleteDish,
};
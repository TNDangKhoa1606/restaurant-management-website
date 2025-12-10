const db = require('../config/db');

// Hàm hỗ trợ để nhóm các món ăn theo danh mục
const groupByCategory = (items) => {

    if (!items || items.length === 0) {
        return [];
    }

    const grouped = items.reduce((acc, item) => {
        const categoryName = item.category_name; // Giữ nguyên vì đây là alias từ câu SQL
        if (!acc[categoryName]) {
            acc[categoryName] = {
                category: categoryName,
                items: []
            };
        }
        // Chuyển đổi cột trong database thành thuộc tính mà frontend cần
        acc[categoryName].items.push({
            id: item.dish_id,
            name: item.name,
            price: parseFloat(item.price), // Đảm bảo giá là một con số
            info: item.description,
            image: item.image_url, // Giữ nguyên path từ DB (đã có /assets/images/...)
            status: item.status
        });
        return acc;

    }, {});

    return Object.values(grouped);
};

const getMenu = async (req, res) => {
    try {
        // Câu lệnh SQL để lấy các món ăn và join với bảng danh mục
        // Đã cập nhật tên bảng và cột để khớp với data.sql
        // Chỉ lấy các món đang ở trạng thái "available"
        const query = `
            SELECT d.dish_id, d.name, d.price, d.description, d.image_url, d.status, c.name AS category_name
            FROM dishes d
            JOIN categories c ON d.category_id = c.category_id
            WHERE d.status = 'available'
            ORDER BY c.category_id, d.dish_id;
        `;

        const [results] = await db.query(query);

        const allGroupedItems = groupByCategory(results);

        // Phân loại menu dựa trên các danh mục trong database
        const sideMenuCategories = ["Món Ăn Kèm", "Tráng miệng", "Đồ uống"];
        const fullMenu = allGroupedItems.filter(group => !sideMenuCategories.includes(group.category));
        const sideMenu = allGroupedItems.filter(group => sideMenuCategories.includes(group.category));

        res.json({ fullMenu, sideMenu });
    } catch (error) {
        console.error('Error fetching menu from database:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

const getMenuCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching menu categories:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

module.exports = { getMenu, getMenuCategories };
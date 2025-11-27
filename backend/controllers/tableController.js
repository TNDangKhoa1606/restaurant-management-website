const db = require('../config/db');

const getFloorLayouts = async (req, res) => {
    try {
        const [floors] = await db.query('SELECT floor_id, name FROM floors ORDER BY floor_id');
        const [tables] = await db.query('SELECT table_id, floor_id, table_name, capacity, status, pos_x, pos_y, price FROM restauranttables');

        const layouts = floors.map(floor => ({
            ...floor,
            elements: tables
                .filter(table => table.floor_id === floor.floor_id)
                .map(t => ({ ...t, type: 'table' }))
        }));

        res.json(layouts);
    } catch (error) {
        console.error('Get floor layouts error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy sơ đồ bàn.' });
    }
};

const createTable = async (req, res) => {
    const { table_name, capacity, floor_id, pos_x, pos_y, price } = req.body;

    if (!table_name || !capacity || !floor_id || pos_x === undefined || pos_y === undefined) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin cho bàn.' });
    }

    let normalizedPrice = 0;
    if (price !== undefined && price !== null && price !== '') {
        normalizedPrice = Number(price);
        if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
            return res.status(400).json({ message: 'Giá bàn không hợp lệ.' });
        }
    }

    try {
        const [result] = await db.query(
            'INSERT INTO restauranttables (table_name, capacity, floor_id, pos_x, pos_y, status, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [table_name, capacity, floor_id, pos_x, pos_y, 'free', normalizedPrice]
        );

        res.status(201).json({ message: 'Tạo bàn mới thành công.', tableId: result.insertId });
    } catch (error) {
        console.error('Create table error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi tạo bàn mới.' });
    }
};

const updateTable = async (req, res) => {
    const { id } = req.params;
    const { table_name, capacity, floor_id, pos_x, pos_y, price } = req.body;

    if (!table_name || !capacity || !floor_id || pos_x === undefined || pos_y === undefined) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin cho bàn.' });
    }

    let normalizedPrice = 0;
    if (price !== undefined && price !== null && price !== '') {
        normalizedPrice = Number(price);
        if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
            return res.status(400).json({ message: 'Giá bàn không hợp lệ.' });
        }
    }

    try {
        const [result] = await db.query(
            'UPDATE restauranttables SET table_name = ?, capacity = ?, floor_id = ?, pos_x = ?, pos_y = ?, price = ? WHERE table_id = ?',
            [table_name, capacity, floor_id, pos_x, pos_y, normalizedPrice, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bàn để cập nhật.' });
        }
        res.json({ message: 'Cập nhật thông tin bàn thành công.' });
    } catch (error) {
        console.error('Update table error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi cập nhật bàn.' });
    }
};

const deleteTable = async (req, res) => {
    const { id } = req.params;

    try {
        // Kiểm tra xem bàn có đang được sử dụng không
        const [tables] = await db.query('SELECT status FROM restauranttables WHERE table_id = ?', [id]);
        if (tables.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bàn để xóa.' });
        }
        if (tables[0].status === 'occupied') {
            return res.status(400).json({ message: 'Không thể xóa bàn đang có khách. Vui lòng hoàn tất đơn hàng trước.' });
        }

        // Tùy chọn: Xóa các đặt bàn trong tương lai cho bàn này
        await db.query('DELETE FROM reservations WHERE table_id = ? AND res_date >= CURDATE()', [id]);

        // Xóa bàn
        await db.query('DELETE FROM restauranttables WHERE table_id = ?', [id]);

        res.json({ message: 'Xóa bàn thành công.' });
    } catch (error) {
        console.error('Delete table error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi xóa bàn.' });
    }
};

const mergeTables = async (req, res) => {
    const { tableIds, groupName } = req.body;

    if (!tableIds || tableIds.length < 2 || !groupName) {
        return res.status(400).json({ message: 'Cần ít nhất 2 bàn và một tên nhóm để thực hiện ghép bàn.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Đánh dấu các bàn được chọn là đã được chiếm và thuộc về một nhóm
        const updateQuery = 'UPDATE restauranttables SET status = ?, group_name = ? WHERE table_id IN (?) AND status = ?';
        const [result] = await connection.query(updateQuery, ['occupied', groupName, tableIds, 'free']);

        if (result.affectedRows !== tableIds.length) {
            await connection.rollback();
            return res.status(400).json({ message: 'Một hoặc nhiều bàn đã được sử dụng hoặc không tồn tại. Vui lòng thử lại.' });
        }

        await connection.commit();
        res.json({ message: `Ghép bàn thành công với tên nhóm là ${groupName}.` });
    } catch (error) {
        await connection.rollback();
        console.error('Merge tables error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi ghép bàn.' });
    } finally {
        connection.release();
    }
};

module.exports = {
    getFloorLayouts,
    createTable,
    updateTable,
    deleteTable,
    mergeTables,
};
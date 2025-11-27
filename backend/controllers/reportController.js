const db = require('../config/db');

// GET /api/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
const getSalesReport = async (req, res) => {
    const { from, to } = req.query;

    try {
        // Xác định khoảng thời gian
        let fromDate;
        let toDate;

        if (from && to) {
            fromDate = `${from} 00:00:00`;
            toDate = `${to} 23:59:59`;
        } else {
            // Mặc định: 7 ngày gần nhất
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
            const format = (d) => d.toISOString().slice(0, 10);
            fromDate = `${format(sevenDaysAgo)} 00:00:00`;
            toDate = `${format(now)} 23:59:59`;
        }

        // Tổng quan: số đơn, doanh thu
        const [summaryRows] = await db.query(
            `SELECT 
                COUNT(*) AS total_orders,
                COALESCE(SUM(total_amount), 0) AS total_revenue
             FROM orders
             WHERE status = 'completed'
               AND placed_at BETWEEN ? AND ?`,
            [fromDate, toDate]
        );

        const summary = {
            total_orders: summaryRows[0]?.total_orders || 0,
            total_revenue: parseFloat(summaryRows[0]?.total_revenue || 0),
        };

        // Doanh thu theo ngày
        const [dailyRows] = await db.query(
            `SELECT 
                DATE(placed_at) AS order_date,
                COUNT(*) AS order_count,
                COALESCE(SUM(total_amount), 0) AS revenue
             FROM orders
             WHERE status = 'completed'
               AND placed_at BETWEEN ? AND ?
             GROUP BY DATE(placed_at)
             ORDER BY order_date ASC`,
            [fromDate, toDate]
        );

        const revenueByDay = dailyRows.map((row) => ({
            order_date: row.order_date,
            order_count: row.order_count,
            revenue: parseFloat(row.revenue || 0),
        }));

        // Top món bán chạy
        const [topDishRows] = await db.query(
            `SELECT 
                oi.dish_id,
                d.name AS dish_name,
                SUM(oi.quantity) AS total_quantity,
                SUM(oi.quantity * oi.unit_price) AS revenue
             FROM orderitems oi
             JOIN orders o ON oi.order_id = o.order_id
             LEFT JOIN dishes d ON oi.dish_id = d.dish_id
             WHERE o.status = 'completed'
               AND o.placed_at BETWEEN ? AND ?
             GROUP BY oi.dish_id, d.name
             ORDER BY total_quantity DESC
             LIMIT 10`,
            [fromDate, toDate]
        );

        const topDishes = topDishRows.map((row) => ({
            dish_id: row.dish_id,
            dish_name: row.dish_name || `Món #${row.dish_id}`,
            total_quantity: row.total_quantity,
            revenue: parseFloat(row.revenue || 0),
        }));

        res.json({
            range: {
                from: fromDate,
                to: toDate,
            },
            summary,
            revenue_by_day: revenueByDay,
            top_dishes: topDishes,
        });
    } catch (error) {
        console.error('Get sales report error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy báo cáo doanh số.' });
    }
};

module.exports = {
    getSalesReport,
};

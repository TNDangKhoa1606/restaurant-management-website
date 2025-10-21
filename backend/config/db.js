require('dotenv').config();
const mysql = require('mysql2/promise');

// Tạo một "pool" kết nối để tái sử dụng các kết nối, tăng hiệu suất
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'resv01_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối khi server khởi động
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the database.');
        connection.release(); // Trả kết nối về pool
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message);
    });

module.exports = pool;
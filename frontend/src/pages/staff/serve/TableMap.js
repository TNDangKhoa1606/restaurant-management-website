import React from 'react';
import { Link } from 'react-router-dom';
import './TableMap.css';

// --- Dữ liệu mẫu ---
const tables = [
    { id: 1, name: 'Bàn 1', status: 'free', capacity: 4 },
    { id: 2, name: 'Bàn 2', status: 'occupied', capacity: 2, currentOrder: 'A102' },
    { id: 3, name: 'Bàn 3', status: 'free', capacity: 6 },
    { id: 4, name: 'Bàn 4', status: 'reserved', capacity: 4, guest: 'Lê Cường' },
    { id: 5, name: 'Bàn 5', status: 'occupied', capacity: 8, currentOrder: 'A101' },
    { id: 6, name: 'Bàn 6', status: 'free', capacity: 2 },
    { id: 7, name: 'Bàn 7', status: 'free', capacity: 4 },
    { id: 8, name: 'Bàn 8', status: 'occupied', capacity: 4, currentOrder: 'A100' },
];

const getStatusInfo = (status) => {
    switch (status) {
        case 'free':
            return { text: 'Trống', className: 'status-free' };
        case 'occupied':
            return { text: 'Đang có khách', className: 'status-occupied' };
        case 'reserved':
            return { text: 'Đã đặt', className: 'status-reserved' };
        default:
            return { text: 'Không xác định', className: '' };
    }
};

const TableCard = ({ table }) => {
    const statusInfo = getStatusInfo(table.status);
    const linkTo = table.status === 'free' ? `/table/${table.id}` : `/waiter/order/${table.currentOrder || table.id}`;

    return (
        <Link to={linkTo} className={`table-card ${statusInfo.className}`}>
            <div className="table-card-header">
                <span className="table-name">{table.name}</span>
                <span className="table-capacity"><i className="fas fa-users"></i> {table.capacity}</span>
            </div>
            <div className="table-card-body">
                <i className={`fas ${table.status === 'free' ? 'fa-check-circle' : 'fa-utensils'}`}></i>
                <p className="table-status-text">{statusInfo.text}</p>
                {table.status === 'reserved' && <p className="table-guest-info">Khách: {table.guest}</p>}
            </div>
        </Link>
    );
};

const TableMap = () => {
    return (
        <div className="table-map-container">
            <div className="table-map-header">
                <h2 className="table-map-title">Sơ đồ bàn</h2>
                <div className="legend">
                    <span className="legend-item free">Trống</span>
                    <span className="legend-item occupied">Có khách</span>
                    <span className="legend-item reserved">Đã đặt</span>
                </div>
            </div>
            <div className="table-grid">
                {tables.map(table => (
                    <TableCard key={table.id} table={table} />
                ))}
            </div>
        </div>
    );
};

export default TableMap;
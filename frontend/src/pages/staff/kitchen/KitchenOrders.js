import React, { useState } from 'react';
import './KitchenOrders.css';

// --- Dữ liệu mẫu ---
const initialOrders = [
    { id: 'A101', table: 'Bàn 5', time: '5 phút trước', status: 'new', items: [{ name: 'Phở Bò', qty: 2 }, { name: 'Gỏi Cuốn', qty: 1 }] },
    { id: 'A102', table: 'Bàn 2', time: '8 phút trước', status: 'new', items: [{ name: 'Ramen Tonkotsu', qty: 1 }] },
    { id: 'A100', table: 'Bàn 8', time: '15 phút trước', status: 'in-progress', items: [{ name: 'Spaghetti Carbonara', qty: 1 }, { name: 'Lasagna', qty: 1 }] },
    { id: 'A099', table: 'Bàn 3', time: '25 phút trước', status: 'done', items: [{ name: 'Pad Thái', qty: 1 }] },
];

const OrderCard = ({ order, onUpdateStatus }) => (
    <div className="order-card">
        <div className="order-card-header">
            <h4>{order.table} - #{order.id}</h4>
            <span>{order.time}</span>
        </div>
        <ul className="order-item-list">
            {order.items.map((item, index) => (
                <li key={index}>
                    <span className="item-qty">{item.qty}x</span>
                    <span className="item-name">{item.name}</span>
                </li>
            ))}
        </ul>
        <div className="order-card-actions">
            {order.status === 'new' && (
                <button onClick={() => onUpdateStatus(order.id, 'in-progress')} className="btn-action btn-start">Bắt đầu làm</button>
            )}
            {order.status === 'in-progress' && (
                <button onClick={() => onUpdateStatus(order.id, 'done')} className="btn-action btn-done">Hoàn thành</button>
            )}
        </div>
    </div>
);

const KitchenOrders = () => {
    const [orders, setOrders] = useState(initialOrders);

    const handleUpdateStatus = (orderId, newStatus) => {
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    const filterOrdersByStatus = (status) => {
        return orders
            .filter(order => order.status === status)
            .sort((a, b) => a.id.localeCompare(b.id)); // Sắp xếp cho ổn định
    };

    return (
        <div className="kitchen-orders-container">
            <div className="kanban-board">
                {/* Cột Mới */}
                <div className="kanban-column">
                    <div className="column-header new">
                        <h3>Mới ({filterOrdersByStatus('new').length})</h3>
                    </div>
                    <div className="column-body">
                        {filterOrdersByStatus('new').map(order => (
                            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                        ))}
                    </div>
                </div>

                {/* Cột Đang làm */}
                <div className="kanban-column">
                    <div className="column-header in-progress">
                        <h3>Đang làm ({filterOrdersByStatus('in-progress').length})</h3>
                    </div>
                    <div className="column-body">
                        {filterOrdersByStatus('in-progress').map(order => (
                            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                        ))}
                    </div>
                </div>

                {/* Cột Đã xong */}
                <div className="kanban-column">
                    <div className="column-header done">
                        <h3>Đã xong ({filterOrdersByStatus('done').length})</h3>
                    </div>
                    <div className="column-body">
                        {filterOrdersByStatus('done').map(order => (
                            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitchenOrders;

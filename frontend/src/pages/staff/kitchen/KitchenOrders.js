import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import './KitchenOrders.css';

const OrderCard = ({ order, onUpdateStatus, canUpdateStatus }) => (
    <div className="order-card">
        <div className="order-card-header">
            <h4>{order.table} - #{order.id}</h4>
            {order.isPreOrder && <span className="pre-order-tag">Pre-order</span>}
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
            {canUpdateStatus && order.status === 'new' && (
                <button onClick={() => onUpdateStatus(order.id, 'in-progress')} className="btn-action btn-start">Bắt đầu làm</button>
            )}
            {canUpdateStatus && order.status === 'in-progress' && (
                <button onClick={() => onUpdateStatus(order.id, 'done')} className="btn-action btn-done">Hoàn thành</button>
            )}
        </div>
    </div>
);

const KitchenOrders = () => {
    const [orders, setOrders] = useState([]);
    const { token, user } = useAuth();
    const role = user?.role?.toLowerCase();
    const canUpdateStatus = role === 'admin' || role === 'kitchen';

    const fetchOrders = useCallback(async () => {
        try {
            const response = await axios.get('/api/orders/kitchen', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const backendOrders = response.data.map(order => ({
                id: order.order_id,
                table: order.table_name,
                time: order.arrival_time || order.placed_at,
                status: order.board_status || 'new',
                items: (order.items || []).map(item => ({
                    name: item.name,
                    qty: item.qty,
                })),
                isPreOrder: !!order.is_preorder,
            }));
            setOrders(backendOrders);
        } catch (error) {
            console.error(error);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!canUpdateStatus || !token) {
            return;
        }

        let backendStatus = newStatus;
        if (newStatus === 'in-progress') {
            backendStatus = 'preparing';
        } else if (newStatus === 'done') {
            backendStatus = 'completed';
        } else if (newStatus === 'new') {
            backendStatus = 'new';
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/api/orders/${orderId}/status`, { status: backendStatus }, config);

            setOrders(prev =>
                prev.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng.');
        }
    };

    const filterOrdersByStatus = (status) => {
        return orders
            .filter(order => order.status === status)
            .sort((a, b) => String(a.id).localeCompare(String(b.id))); // Sắp xếp cho ổn định
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
                            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} canUpdateStatus={canUpdateStatus} />
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
                            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} canUpdateStatus={canUpdateStatus} />
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

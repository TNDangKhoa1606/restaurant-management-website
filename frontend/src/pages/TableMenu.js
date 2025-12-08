import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TableMenu.css';
import { mockMenu } from '../components/reservation/PreOrderPopup';
import { useNotification } from '../components/common/NotificationContext';
import { useCurrency } from '../components/common/CurrencyContext';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

function TableMenu() {
    const { tableId } = useParams(); // Lấy tableId từ URL
    const { notify } = useNotification();
    const { formatPrice } = useCurrency();

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [orderItems, setOrderItems] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchMenu = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get('/api/menu');

                const normalized = [];

                if (data && Array.isArray(data.fullMenu)) {
                    data.fullMenu.forEach(group => {
                        if (!group || !Array.isArray(group.items)) return;
                        group.items.forEach(item => {
                            normalized.push({
                                id: item.id,
                                name: item.name,
                                description: item.description || '',
                                price: item.price,
                                category: group.category,
                                image: item.image,
                            });
                        });
                    });
                }

                if (data && Array.isArray(data.sideMenu)) {
                    data.sideMenu.forEach(group => {
                        if (!group || !Array.isArray(group.items)) return;
                        group.items.forEach(item => {
                            normalized.push({
                                id: item.id,
                                name: item.name,
                                description: item.description || '',
                                price: item.price,
                                category: group.category,
                                image: item.image,
                            });
                        });
                    });
                }

                if (isMounted) {
                    if (normalized.length > 0) {
                        setMenuItems(normalized);
                        setError('');
                    } else {
                        setMenuItems(mockMenu.map(item => ({
                            id: item.id,
                            name: item.name,
                            description: '',
                            price: item.price,
                            category: item.category,
                            image: item.image,
                        })));
                        setError('Đang sử dụng dữ liệu thực đơn tạm thời.');
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Không thể tải thực đơn cho TableMenu:', err);
                    setMenuItems(mockMenu.map(item => ({
                        id: item.id,
                        name: item.name,
                        description: '',
                        price: item.price,
                        category: item.category,
                        image: item.image,
                    })));
                    setError(err.response?.data?.message || 'Không thể tải thực đơn. Đang sử dụng dữ liệu tạm thời.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchMenu();

        return () => {
            isMounted = false;
        };
    }, []);

    const categories = useMemo(
        () => [
            'all',
            ...Array.from(new Set(
                (menuItems || [])
                    .map(item => item.category)
                    .filter(category => category && typeof category === 'string')
            )),
        ],
        [menuItems]
    );

    const filteredMenuItems = useMemo(
        () =>
            selectedCategory === 'all'
                ? menuItems
                : menuItems.filter(item => item.category === selectedCategory),
        [selectedCategory, menuItems]
    );

    const addToOrder = (item) => {
        const exist = orderItems.find((x) => x.id === item.id);
        if (exist) {
            setOrderItems(
                orderItems.map((x) =>
                    x.id === item.id ? { ...exist, qty: exist.qty + 1 } : x
                )
            );
        } else {
            setOrderItems([...orderItems, { ...item, qty: 1 }]);
        }
    };

    const removeFromOrder = (item) => {
        const exist = orderItems.find((x) => x.id === item.id);
        if (exist.qty === 1) {
            setOrderItems(orderItems.filter((x) => x.id !== item.id));
        } else {
            setOrderItems(
                orderItems.map((x) =>
                    x.id === item.id ? { ...exist, qty: exist.qty - 1 } : x
                )
            );
        }
    };

    const totalOrderPrice = orderItems.reduce((a, c) => a + c.qty * c.price, 0);

    const handleSubmitOrder = async () => {
        if (orderItems.length === 0) {
            notify('Vui lòng chọn món trước khi gửi yêu cầu.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const items = orderItems.map(item => ({
                dishId: item.id,
                quantity: item.qty,
            }));

            const payload = {
                items,
                customer: {
                    name: `Khách tại bàn ${tableId}`,
                    phone: '0000000000',
                    address: '',
                },
                note: `Order tại bàn ${tableId}`,
                orderType: 'dine-in',
                paymentMethod: 'cash',
                userId: null,
                tableId: parseInt(tableId, 10),
            };

            await axios.post('/api/orders', payload);

            notify(`Đã gửi yêu cầu cho bàn số ${tableId}. Vui lòng chờ trong giây lát.`, 'success');
            setOrderItems([]);
        } catch (error) {
            console.error('Lỗi khi tạo order tại bàn:', error);
            notify(
                error.response?.data?.message || 'Không thể tạo đơn hàng tại bàn. Vui lòng thử lại.',
                'error',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="table-menu-page">
            <div className="table-menu-container">
                {/* Cột bên trái: Thực đơn */}
                <div className="menu-selection-section">
                    <div className="menu-header">
                        <h1>Thực đơn cho bàn số {tableId}</h1>
                        <p>Chọn món và gửi yêu cầu trực tiếp đến bếp.</p>
                    </div>

                    <div className="menu-categories">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={selectedCategory === category ? 'active' : ''}
                            >
                                {category === 'all' ? 'Tất cả' : category}
                            </button>
                        ))}
                    </div>

                    {loading && <p>Đang tải thực đơn...</p>}
                    {error && !loading && <p className="error-text">{error}</p>}

                    <div className="menu-grid">
                        {filteredMenuItems.map(item => (
                            <div key={item.id} className="menu-item-card">
                                <img src={item.image} alt={item.name} className="menu-item-image" />
                                <div className="menu-item-info">
                                    <h3 className="menu-item-name">{item.name}</h3>
                                    {item.description && (
                                        <p className="menu-item-description">{item.description}</p>
                                    )}

                                    <div className="menu-item-footer">
                                        <span className="menu-item-price">{formatPrice(item.price)}</span>
                                        <button className="btn-add-to-cart" onClick={() => addToOrder(item)}>Chọn</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cột bên phải: Tóm tắt đơn hàng */}
                <div className="order-summary-panel">
                    <div className="order-summary-header">
                        <h2>Yêu cầu của bạn</h2>
                    </div>
                    <div className="order-summary-body">
                        {orderItems.length === 0 && <div className="order-empty">Vui lòng chọn món từ thực đơn.</div>}
                        {orderItems.map(item => (
                            <div key={item.id} className="order-item">
                                <div className="order-item-details">
                                    <span className="order-item-name">{item.qty} x {item.name}</span>
                                    <span className="order-item-price">{formatPrice(item.price * item.qty)}</span>
                                </div>
                                <div className="order-item-actions">
                                    <button onClick={() => removeFromOrder(item)} className="btn-qty-small">-</button>
                                    <button onClick={() => addToOrder(item)} className="btn-qty-small">+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {orderItems.length > 0 && (
                        <div className="order-summary-footer">
                            <div className="summary-total-row">
                                <span>Tạm tính</span>
                                <span>{formatPrice(totalOrderPrice)}</span>
                            </div>
                            <button className="btn-submit-order" onClick={handleSubmitOrder} disabled={isSubmitting}>
                                {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu đến bếp'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TableMenu;
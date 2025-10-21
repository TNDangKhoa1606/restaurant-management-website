import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './TableMenu.css';

// --- Dữ liệu giả lập (tạm thời lấy từ Menu.js) ---
const menuData = {
    categories: [
        { id: 'asia', name: 'Mì Châu Á' },
        { id: 'europe', name: 'Mì Châu Âu' },
        { id: 'sides', name: 'Món ăn kèm' },
        { id: 'drinks', name: 'Đồ uống' },
    ],
    items: [
        { id: 1, categoryId: 'asia', name: 'Phở Bò Tái Chín', description: 'Nước dùng đậm đà, thịt bò mềm, bánh phở dai.', price: 65000, image: 'https://i.postimg.cc/L6x14gLd/pho-bo.jpg' },
        { id: 2, categoryId: 'asia', name: 'Ramen Tonkotsu', description: 'Sợi mì ramen trong nước hầm xương heo béo ngậy.', price: 120000, image: 'https://i.postimg.cc/W1YwZ0ZT/ramen.jpg' },
        { id: 3, categoryId: 'asia', name: 'Pad Thái Hải Sản', description: 'Mì gạo xào với tôm, mực và sốt me chua ngọt.', price: 95000, image: 'https://i.postimg.cc/pXkLdZTk/pad-thai.jpg' },
        { id: 4, categoryId: 'europe', name: 'Mì Ý Sốt Bò Bằm', description: 'Sợi mì Ý dai ngon quyện trong sốt cà chua và thịt bò.', price: 110000, image: 'https://i.postimg.cc/G3T85KzP/spaghetti.jpg' },
        { id: 5, categoryId: 'europe', name: 'Mì Carbonara', description: 'Sốt kem béo ngậy từ trứng, phô mai và thịt heo muối.', price: 115000, image: 'https://i.postimg.cc/Wp4g2dG2/carbonara.jpg' },
        { id: 6, categoryId: 'sides', name: 'Gyoza Chiên Giòn', description: 'Bánh xếp Nhật Bản với nhân thịt và rau củ.', price: 55000, image: 'https://i.postimg.cc/KzB7sYx4/gyoza.jpg' },
    ]
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

function TableMenu() {
    const { tableId } = useParams(); // Lấy tableId từ URL
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [orderItems, setOrderItems] = useState([]);

    const filteredMenuItems = selectedCategory === 'all'
        ? menuData.items
        : menuData.items.filter(item => item.categoryId === selectedCategory);

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

    const handleSubmitOrder = () => {
        if (orderItems.length === 0) {
            alert('Vui lòng chọn món trước khi gửi yêu cầu.');
            return;
        }
        // Logic gửi đơn hàng đến backend sẽ được thêm sau
        console.log(`Submitting order for table ${tableId}:`, orderItems);
        alert(`Đã gửi yêu cầu cho bàn số ${tableId}. Vui lòng chờ trong giây lát.`);
        setOrderItems([]); // Xóa các món đã chọn sau khi gửi
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
                        <button onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'active' : ''}>Tất cả</button>
                        {menuData.categories.map(category => (
                            <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={selectedCategory === category.id ? 'active' : ''}>
                                {category.name}
                            </button>
                        ))}
                    </div>

                    <div className="menu-grid">
                        {filteredMenuItems.map(item => (
                            <div key={item.id} className="menu-item-card">
                                <img src={item.image} alt={item.name} className="menu-item-image" />
                                <div className="menu-item-info">
                                    <h3 className="menu-item-name">{item.name}</h3>
                                    <p className="menu-item-description">{item.description}</p>
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
                            <button className="btn-submit-order" onClick={handleSubmitOrder}>
                                Gửi yêu cầu đến bếp
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TableMenu;
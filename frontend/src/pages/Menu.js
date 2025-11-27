import React, { useState } from 'react';
import './Menu.css'; // CSS cho trang Menu

// --- Dữ liệu giả lập ---
const menuData = {
    categories: [
        { id: 'asia', name: 'Mì Châu Á' },
        { id: 'europe', name: 'Mì Châu Âu' },
        { id: 'sides', name: 'Món ăn kèm' },
        { id: 'drinks', name: 'Đồ uống' },
    ],
    items: [
        { id: 1, categoryId: 'asia', name: 'Phở Bò Tái Chín', description: 'Nước dùng đậm đà, thịt bò mềm, bánh phở dai. Một tuyệt tác của ẩm thực Việt.', price: 65000, image: 'https://i.postimg.cc/L6x14gLd/pho-bo.jpg' },
        { id: 2, categoryId: 'asia', name: 'Ramen Tonkotsu', description: 'Sợi mì ramen trong nước hầm xương heo béo ngậy, ăn kèm thịt heo chashu, trứng lòng đào.', price: 120000, image: 'https://i.postimg.cc/W1YwZ0ZT/ramen.jpg' },
        { id: 3, categoryId: 'asia', name: 'Pad Thái Hải Sản', description: 'Mì gạo xào với tôm, mực, giá đỗ và sốt me chua ngọt đặc trưng của Thái Lan.', price: 95000, image: 'https://i.postimg.cc/pXkLdZTk/pad-thai.jpg' },
        { id: 4, categoryId: 'europe', name: 'Mì Ý Sốt Bò Bằm', description: 'Sợi mì Ý dai ngon quyện trong sốt cà chua và thịt bò bằm đậm đà, rắc phô mai Parmesan.', price: 110000, image: 'https://i.postimg.cc/G3T85KzP/spaghetti.jpg' },
        { id: 5, categoryId: 'europe', name: 'Mì Carbonara', description: 'Sốt kem béo ngậy từ trứng, phô mai Pecorino và thịt heo muối Guanciale.', price: 115000, image: 'https://i.postimg.cc/Wp4g2dG2/carbonara.jpg' },
        { id: 6, categoryId: 'sides', name: 'Gyoza Chiên Giòn', description: 'Bánh xếp Nhật Bản với nhân thịt và rau củ, vỏ ngoài giòn rụm, bên trong mọng nước.', price: 55000, image: 'https://i.postimg.cc/KzB7sYx4/gyoza.jpg' },
        { id: 7, categoryId: 'sides', name: 'Salad Trộn Dầu Giấm', description: 'Rau xanh tươi mát với sốt dầu giấm chua dịu, giúp cân bằng vị giác.', price: 45000, image: 'https://i.postimg.cc/tJ3gSgGz/salad.jpg' },
        { id: 8, categoryId: 'drinks', name: 'Coca-Cola', description: 'Lon 330ml', price: 20000, image: 'https://i.postimg.cc/d1mJgL9T/coke.jpg' },
        { id: 9, categoryId: 'drinks', name: 'Nước Suối Lavie', description: 'Chai 500ml', price: 15000, image: 'https://i.postimg.cc/W4Lg2xWb/water.jpg' },
    ]
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

function Menu({ onAddToCart }) {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredItems = selectedCategory === 'all'
        ? menuData.items
        : menuData.items.filter(item => item.categoryId === selectedCategory);

    return (
        <div className="menu-page">
            <div className="menu-header">
                <h1>Thực Đơn Của Chúng Tôi</h1>
                <p>Khám phá thế giới noodles đa dạng và các món ăn kèm đặc sắc.</p>
            </div>

            <div className="menu-categories">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={selectedCategory === 'all' ? 'active' : ''}
                >
                    Tất cả
                </button>
                {menuData.categories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={selectedCategory === category.id ? 'active' : ''}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            <div className="menu-grid">
                {filteredItems.map(item => (
                    <div key={item.id} className="menu-item-card">
                        <img src={item.image} alt={item.name} className="menu-item-image" />
                        <div className="menu-item-info">
                            <h3 className="menu-item-name">{item.name}</h3>
                            <p className="menu-item-description">{item.description}</p>
                            <div className="menu-item-footer">
                                <span className="menu-item-price">{formatPrice(item.price)}</span>
                                <button className="btn-add-to-cart" onClick={() => onAddToCart(item)}>Thêm vào giỏ</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Menu;
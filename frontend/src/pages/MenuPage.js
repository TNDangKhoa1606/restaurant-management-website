import React, { useState } from 'react';
import './MenuPage.css';

// --- Dữ liệu mẫu cho thực đơn ---
const menuData = {
    mainDishes: [
        {
            title: 'Các loại Mì Châu Á',
            image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            items: ['Phở Bò (Việt Nam)', 'Ramen Tonkotsu (Nhật Bản)', 'Pad Thái (Thái Lan)', 'Mì Jajangmyeon (Hàn Quốc)']
        },
        {
            title: 'Các loại Mì Châu Âu',
            image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            items: ['Spaghetti Carbonara', 'Lasagna al Forno', 'Fettuccine Alfredo', 'Penne all\'Arrabbiata']
        },
        {
            title: 'Món đặc biệt',
            image: 'https://images.pexels.com/photos/769969/pexels-photo-769969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            items: ['Cơm trộn Bibimbap', 'Bò lúc lắc', 'Salad Caesar với gà nướng', 'Súp bí đỏ kem nấm']
        }
    ],
    sidesAndDrinks: [
        {
            title: 'Món ăn kèm',
            image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            items: ['Gỏi cuốn tôm thịt', 'Salad rong biển trứng cua', 'Khoai tây chiên', 'Kim chi cải thảo']
        },
        {
            title: 'Tráng miệng',
            image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            items: ['Tiramisu', 'Panna Cotta dâu', 'Chè khúc bạch', 'Bánh mochi kem']
        },
        {
            title: 'Đồ uống',
            image: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            items: ['Nước ép cam tươi', 'Trà đào cam sả', 'Coca-Cola / Pepsi', 'Nước suối Aquafina']
        }
    ]
};

// Component cho một danh mục món ăn
const MenuCategoryCard = ({ title, image, items }) => (
    <div className="menu-category-card">
        <div className="card-inner">
            <div className="card-image-wrapper">
                <img src={image} alt={title} />
            </div>
            <h3 className="card-title">{title}</h3>
            <ul className="card-item-list">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    </div>
);

const MenuPage = () => {
    const [activeTab, setActiveTab] = useState('mainDishes');

    return (
        <section className="menu-page-section">
            <div className="menu-page-container">
                <div className="tabbed-content">
                    <h4 className="menu-page-title">THỰC ĐƠN CỦA CHÚNG TÔI</h4>
                    <ul className="nav-tabs">
                        <li className={`tab ${activeTab === 'mainDishes' ? 'active' : ''}`} onClick={() => setActiveTab('mainDishes')}>
                            <a><span>Mì & Món chính</span></a>
                        </li>
                        <li className={`tab ${activeTab === 'sidesAndDrinks' ? 'active' : ''}`} onClick={() => setActiveTab('sidesAndDrinks')}>
                            <a><span>Món ăn kèm & Đồ uống</span></a>
                        </li>
                    </ul>
                    <div className="tab-panels">
                        {/* Panel Món chính */}
                        <div className={`panel ${activeTab === 'mainDishes' ? 'active' : ''}`}>
                            <p className="panel-subtitle"><em>* Giá món ăn có thể thay đổi theo thời điểm.</em></p>
                            <div className="category-grid">
                                {menuData.mainDishes.map((category, index) => (
                                    <MenuCategoryCard key={index} {...category} />
                                ))}
                            </div>
                        </div>
                        {/* Panel Món ăn kèm & Đồ uống */}
                        <div className={`panel ${activeTab === 'sidesAndDrinks' ? 'active' : ''}`}>
                            <p className="panel-subtitle"><em>* Luôn có những món tráng miệng và đồ uống đặc biệt theo mùa.</em></p>
                            <div className="category-grid">
                                {menuData.sidesAndDrinks.map((category, index) => (
                                    <MenuCategoryCard key={index} {...category} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MenuPage;
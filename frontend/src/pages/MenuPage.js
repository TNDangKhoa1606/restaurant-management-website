import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MenuPage.css';
import { useCurrency } from '../components/common/CurrencyContext';

// --- Dữ liệu mẫu cho thực đơn ---
const fallbackMenuData = {
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
const MenuCategoryCard = ({ title, image, items }) => {
    const { formatPrice } = useCurrency();

    const renderItemText = (item) => {
        if (!item) return '';

        if (typeof item === 'string') {
            return item;
        }

        const name = item.name || '';
        const price = item.price;

        if (price === null || price === undefined) {
            return name;
        }

        return `${name} – ${formatPrice(price)}`;
    };

    return (
        <div className="menu-category-card">
            <div className="card-inner">
                <div className="card-image-wrapper">
                    <img src={image} alt={title} />
                </div>
                <h3 className="card-title">{title}</h3>
                <ul className="card-item-list">
                    {items.map((item, index) => (
                        <li key={index}>{renderItemText(item)}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const MenuPage = () => {
    const [activeTab, setActiveTab] = useState('mainDishes');
    const [menuData, setMenuData] = useState(fallbackMenuData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { formatPrice } = useCurrency();

    const getCategoryImage = (categoryName) => {
        switch (categoryName) {
            case 'Khai vị':
                return 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
            case 'Món chính':
                return 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
            case 'Tráng miệng':
                return 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
            case 'Đồ uống':
                return 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
            case 'Món Ăn Kèm':
                return 'https://images.pexels.com/photos/3642713/pexels-photo-3642713.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
            default:
                return 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
        }
    };

    const splitMainDishesByType = (items) => {
        const createGroup = (title, image) => ({
            title,
            image,
            items: [],
        });

        const noodleImage = 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

        const groups = {
            vietnam: createGroup('Mì, Phở & Bún Việt Nam', noodleImage),
            japan: createGroup('Mì Nhật Bản', noodleImage),
            korea: createGroup('Mì Hàn Quốc', noodleImage),
            thailand: createGroup('Mì Thái Lan', noodleImage),
            singaporeMalaysia: createGroup('Mì Singapore & Malaysia', noodleImage),
            china: createGroup('Mì Trung Hoa', noodleImage),
            italy: createGroup(
                'Mì Ý & Pasta',
                'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            ),
            others: createGroup(
                'Món chính khác',
                'https://images.pexels.com/photos/769969/pexels-photo-769969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            ),
        };

        const containsAny = (text, keywords) => {
            const lower = (text || '').toLowerCase();
            return keywords.some((keyword) => lower.includes(keyword));
        };

        items.forEach((item) => {
            const name = item.name || '';
            const dishItem = {
                name,
                price: item.price,
            };

            // Việt Nam: phở, bún, mì Quảng, Huế, riêu
            if (
                containsAny(name, [
                    'phở',
                    'bún',
                    'mì quảng',
                    'huế',
                    'riêu',
                    'việt',
                ])
            ) {
                groups.vietnam.items.push(dishItem);
                return;
            }

            // Hàn Quốc: kimchi, jjajang, naengmyeon, bulgogi, hàn quốc
            if (
                containsAny(name, [
                    'hàn quốc',
                    'kimchi',
                    'jjajang',
                    'naengmyeon',
                    'bulgogi',
                ])
            ) {
                groups.korea.items.push(dishItem);
                return;
            }

            // Thái Lan: pad thai, pad see ew, tom yum, thái
            if (
                containsAny(name, [
                    'pad thai',
                    'pad see ew',
                    'tom yum',
                    'tomyum',
                    'thái',
                ])
            ) {
                groups.thailand.items.push(dishItem);
                return;
            }

            // Singapore & Malaysia: laksa, hokkien, singapore, mã lai, malaysia
            if (
                containsAny(name, [
                    'laksa',
                    'hokkien',
                    'singapore',
                    'mã lai',
                    'malaysia',
                ])
            ) {
                groups.singaporeMalaysia.items.push(dishItem);
                return;
            }

            // Nhật Bản: ramen, udon, soba, somen, nhật
            if (
                containsAny(name, [
                    'ramen',
                    'udon',
                    'soba',
                    'somen',
                    'nhật',
                ])
            ) {
                groups.japan.items.push(dishItem);
                return;
            }

            // Ý / Pasta: spaghetti, penne, fettuccine, lasagna, tagliatelle, mì ý
            if (
                containsAny(name, [
                    'spaghetti',
                    'penne',
                    'fettuccine',
                    'lasagna',
                    'tagliatelle',
                    'mì ý',
                    'pasta',
                ])
            ) {
                groups.italy.items.push(dishItem);
                return;
            }

            // Trung Hoa: hoành thánh, xá xíu, trung hoa
            if (
                containsAny(name, [
                    'hoành thánh',
                    'xá xíu',
                    'trung hoa',
                ])
            ) {
                groups.china.items.push(dishItem);
                return;
            }

            // Còn lại
            groups.others.items.push(dishItem);
        });

        return Object.values(groups).filter((group) => group.items.length > 0);
    };

    useEffect(() => {
        let isMounted = true;

        const fetchMenu = async () => {
            try {
                setLoading(true);

                const { data } = await axios.get('/api/menu');

                if (!isMounted) return;

                if (!data || (!Array.isArray(data.fullMenu) && !Array.isArray(data.sideMenu))) {
                    setMenuData(fallbackMenuData);
                    setError('Đang sử dụng dữ liệu thực đơn mẫu.');
                    return;
                }

                const mainDishes = [];
                const sidesAndDrinks = [];

                if (Array.isArray(data.fullMenu)) {
                    data.fullMenu.forEach((group) => {
                        if (!group || !Array.isArray(group.items)) return;

                        if (group.category === 'Món chính') {
                            const splittedGroups = splitMainDishesByType(group.items);
                            splittedGroups.forEach((g) => mainDishes.push(g));
                        } else {
                            mainDishes.push({
                                title: group.category,
                                image: getCategoryImage(group.category),
                                items: group.items.map((item) => ({
                                    name: item.name,
                                    price: item.price,
                                })),
                            });
                        }
                    });
                }

                if (Array.isArray(data.sideMenu)) {
                    data.sideMenu.forEach((group) => {
                        if (!group || !Array.isArray(group.items)) return;
                        sidesAndDrinks.push({
                            title: group.category,
                            image: getCategoryImage(group.category),
                            items: group.items.map((item) => ({
                                name: item.name,
                                price: item.price,
                            })),
                        });
                    });
                }

                if (!mainDishes.length && !sidesAndDrinks.length) {
                    setMenuData(fallbackMenuData);
                    setError('Đang sử dụng dữ liệu thực đơn mẫu.');
                } else {
                    setMenuData({
                        mainDishes,
                        sidesAndDrinks,
                    });
                    setError('');
                }
            } catch (err) {
                if (!isMounted) return;
                console.error('Không thể tải thực đơn cho trang Menu:', err);
                setMenuData(fallbackMenuData);
                setError('Không thể tải thực đơn từ máy chủ. Đang hiển thị dữ liệu mẫu.');
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

    return (
        <section className="menu-page-section">
            <div className="menu-page-container">
                <div className="tabbed-content">
                    <h4 className="menu-page-title">THỰC ĐƠN CỦA CHÚNG TÔI</h4>
                    {loading && <p className="menu-status-text">Đang tải thực đơn...</p>}
                    {!loading && error && <p className="menu-status-text error-text">{error}</p>}
                    <ul className="nav-tabs">
                        <li className={`tab ${activeTab === 'mainDishes' ? 'active' : ''}`}>
                            <button type="button" onClick={() => setActiveTab('mainDishes')}>
                                <span>Mì & Món chính</span>
                            </button>
                        </li>
                        <li className={`tab ${activeTab === 'sidesAndDrinks' ? 'active' : ''}`}>
                            <button type="button" onClick={() => setActiveTab('sidesAndDrinks')}>
                                <span>Món ăn kèm & Đồ uống</span>
                            </button>
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
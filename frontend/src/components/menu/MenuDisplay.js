import React from 'react';
import { useCurrency } from '../common/CurrencyContext';

// Component để render một mục trong menu
const MenuItem = ({ id, name, price, info, onAddToCart }) => {
    const { formatPrice } = useCurrency();

    return (
        <div className="py-4">
            <div className="flex items-end justify-between">
                <h3 className="text-xl font-semibold text-text-dark pr-2">{name}</h3>
                {/* Dòng chấm chấm sẽ lấp đầy không gian */}
                <div className="flex-grow border-b-2 border-dotted border-gray-300 mx-2"></div>
                <span className="text-xl font-bold text-secondary pl-2 whitespace-nowrap">
                    {formatPrice(price)}
                </span>
            </div>
            {info && (
                <p className="text-text-muted text-sm italic mt-1">{info}</p>
            )}
            {onAddToCart && (
                <button onClick={() => onAddToCart({ id, name, price, info })} className="mt-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors text-sm">
                    Thêm vào giỏ
                </button>
            )}
        </div>
    );
};

// Component để render một khu vực menu (ví dụ: Món chính)
const MenuSection = ({ category, description, items, onAddToCart }) => (
    <div className="mb-16">
        <div className="text-left mb-6">
            <h2 className="text-3xl font-bold text-primary mb-2">{category}</h2>
            {description && (
                <p className="text-base text-text-muted max-w-3xl">{description}</p>
            )}
        </div>
        <div className="flex flex-col"> {/* Truyền onAddToCart xuống MenuItem */}
            {items.map(item => <MenuItem key={item.id} {...item} onAddToCart={onAddToCart} />)}
        </div>
    </div>
);

// --- Dữ liệu mẫu ---
const fullMenuDataSample = [
    {
        category: "Mì Châu Á",
        items: [
            { id: 'h1', name: 'Phở Bò (Việt Nam)', price: 70000, info: 'Nước dùng bò đậm đà, bánh phở mềm và các loại rau thơm tươi.' },
            { id: 'h2', name: 'Ramen Tonkotsu (Nhật Bản)', price: 120000, info: 'Nước dùng xương heo béo ngậy, thịt heo chashu, trứng lòng đào và măng.' },
            { id: 'h3', name: 'Pad Thái (Thái Lan)', price: 95000, info: 'Mì gạo xào với tôm, đậu phụ, giá đỗ và sốt me chua ngọt.' },
        ]
    },
    {
        category: "Mì Châu Âu",
        items: [
            { id: 'b1', name: 'Spaghetti Carbonara (Ý)', price: 150000, info: 'Mì Ý với sốt kem từ trứng, phô mai Pecorino, và thịt heo muối Guanciale.' },
            { id: 'b2', name: 'Lasagna al Forno (Ý)', price: 180000, info: 'Các lớp mì lasagna, sốt thịt bò ragu, sốt béchamel và phô mai Parmesan nướng.' },
        ]
    },
];

const sideMenuDataSample = [
    {
        category: "Món Ăn Kèm",
        items: [
            { id: 'v1', name: 'Gỏi Cuốn (Việt Nam)', price: 50000, info: 'Bánh tráng cuốn tôm, thịt, bún và rau sống, ăn kèm với tương đen.' },
            { id: 'v2', name: 'Kim Chi (Hàn Quốc)', price: 30000, info: 'Cải thảo lên men với ớt, tỏi và gừng.' },
        ]
    },
    {
        category: "Tráng Miệng",
        items: [
            { id: 't1', name: 'Chè Ba Màu (Việt Nam)', price: 35000, info: 'Đậu xanh, đậu đỏ, và sương sáo với nước cốt dừa.' },
            { id: 't2', name: 'Tiramisu (Ý)', price: 75000, info: 'Bánh quy Savoiardi nhúng cà phê, xen kẽ với kem phô mai mascarpone.' },
        ]
    },
];
// --- Kết thúc dữ liệu mẫu ---

function MenuDisplay({ onAddToCart }) { // Nhận onAddToCart từ props
    // Sử dụng dữ liệu mẫu thay vì gọi API
    const fullMenuData = fullMenuDataSample;
    const sideMenuData = sideMenuDataSample;

    return (
        <section id="menu" className="py-16 sm:py-24 bg-bg-light text-text-dark">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap -mx-4">
                    {/* Cột trái (menu mới, lệch xuống) */}
                    <div className="w-full lg:w-1/2 px-4 lg:mt-24">
                        <div className="text-left mb-16">
                            <p className="text-2xl text-primary">Khám phá</p>
                            <h2 className="text-4xl font-bold text-primary mb-4">Thực đơn của chúng tôi</h2>
                            <p className="text-text-muted">
                                Các đầu bếp của chúng tôi dành nhiều sự quan tâm hàng tháng để tạo ra các thực đơn mới dựa trên các sản phẩm theo mùa của địa phương. Bạn có bị dị ứng không? Hãy cho chúng tôi biết, chúng tôi rất sẵn lòng chuẩn bị một món ăn ngon cho bạn phù hợp với yêu cầu ăn kiêng của bạn. Bạn sẽ chọn thực đơn của Bếp trưởng (chay) của chúng tôi hay bạn thích chọn món à la carte hơn?
                            </p>
                        </div>
                        {/* Truyền onAddToCart xuống MenuSection */}
                        {sideMenuData.map(section => (
                            < MenuSection key={section.category} {...section} onAddToCart={onAddToCart} />
                        ))}

                        <p className="text-text-muted italic mt-8 text-left">* Có lựa chọn ăn chay</p>
                    </div>
                    {/* Cột phải (menu gốc) */}
                    <div className="w-full lg:w-1/2 px-4"> {/* Truyền onAddToCart xuống MenuSection */}
                        {fullMenuData.map(section => (
                            <MenuSection key={section.category} {...section} onAddToCart={onAddToCart} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default MenuDisplay;

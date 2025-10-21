import React, { useState, useMemo } from 'react';
import './PreOrderPopup.css';

export const mockMenu = [
  // Việt Nam
  { id: 1, name: "Phở bò tái Hà Nội", price: 70000, category: "Việt Nam", image: "/img/pho.jpg" },
  { id: 2, name: "Bún bò Huế", price: 65000, category: "Việt Nam", image: "/img/bunbohue.jpg" },
  { id: 3, name: "Mì Quảng Đà Nẵng", price: 60000, category: "Việt Nam", image: "/img/miquang.jpg" },
  { id: 4, name: "Hủ tiếu Nam Vang", price: 65000, category: "Việt Nam", image: "/img/hutieu.jpg" },
  // Nhật Bản
  { id: 5, name: "Ramen Tonkotsu", price: 95000, category: "Nhật Bản", image: "/img/ramen_tonkotsu.jpg" },
  { id: 6, name: "Ramen Shoyu", price: 90000, category: "Nhật Bản", image: "/img/ramen_shoyu.jpg" },
  { id: 7, name: "Soba lạnh Zaru", price: 85000, category: "Nhật Bản", image: "/img/soba.jpg" },
  { id: 8, name: "Udon hải sản", price: 88000, category: "Nhật Bản", image: "/img/udon.jpg" },
  // Hàn Quốc
  { id: 12, name: "Mì lạnh Naengmyeon", price: 89000, category: "Hàn Quốc", image: "/img/naengmyeon.jpg" },
  { id: 13, name: "Jajangmyeon (Mì tương đen)", price: 82000, category: "Hàn Quốc", image: "/img/jajangmyeon.jpg" },
  { id: 14, name: "Ramyun cay Hàn Quốc", price: 75000, category: "Hàn Quốc", image: "/img/ramyun.jpg" },
  // Quốc tế khác
  { id: 9, name: "Mì vịt quay Quảng Đông", price: 110000, category: "Quốc tế khác", image: "/img/mi_vit_quay.jpg" },
  { id: 10, name: "Mì hoành thánh Tứ Xuyên", price: 90000, category: "Quốc tế khác", image: "/img/hoan_thanh.jpg" },
  { id: 11, name: "Mì lạnh Bắc Kinh", price: 87000, category: "Quốc tế khác", image: "/img/mi_lanh.jpg" },
  { id: 15, name: "Pad Thai tôm", price: 92000, category: "Quốc tế khác", image: "/img/padthai.jpg" },
  { id: 16, name: "Mì Tom Yum", price: 97000, category: "Quốc tế khác", image: "/img/tomyum.jpg" },
  { id: 17, name: "Spaghetti Bolognese", price: 99000, category: "Quốc tế khác", image: "/img/spaghetti_bolognese.jpg" },
  { id: 18, name: "Spaghetti Carbonara", price: 95000, category: "Quốc tế khác", image: "/img/spaghetti_carbonara.jpg" },
  { id: 19, name: "Mì Pesto Genovese", price: 98000, category: "Quốc tế khác", image: "/img/pesto.jpg" },
  { id: 20, name: "Mì Laksa Malaysia", price: 90000, category: "Quốc tế khác", image: "/img/laksa.jpg" },
  { id: 21, name: "Mì Singapore khô", price: 85000, category: "Quốc tế khác", image: "/img/mi_singapore.jpg" },
  { id: 22, name: "Mì Ragu Indonesia", price: 83000, category: "Quốc tế khác", image: "/img/mi_ragu.jpg" },
  // Đồ uống & tráng miệng
  { id: 23, name: "Trà sữa trân châu", price: 35000, category: "Đồ uống", image: "/img/trasua.jpg" },
  { id: 24, name: "Trà chanh sả gừng", price: 30000, category: "Đồ uống", image: "/img/trachanh.jpg" },
  { id: 25, name: "Chè khúc bạch", price: 35000, category: "Tráng miệng", image: "/img/chekhucbach.jpg" },
  { id: 26, name: "Kem dừa non", price: 40000, category: "Tráng miệng", image: "/img/kemdua.jpg" }
];

export default function PreOrderPopup({ onClose, onSubmit }) {
  const [preOrderItems, setPreOrderItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const categories = useMemo(
    () => ["Tất cả", ...new Set(mockMenu.map((item) => item.category))],
    []
  );

  const filteredDishes = useMemo(
    () =>
      selectedCategory === "Tất cả"
        ? mockMenu
        : mockMenu.filter((dish) => dish.category === selectedCategory),
    [selectedCategory]
  );

  const total = useMemo(
    () => preOrderItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [preOrderItems]
  );

  const handleAddToPreOrder = (dish) => {
    setPreOrderItems((prev) => {
      const existingItem = prev.find((item) => item.id === dish.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === dish.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...dish, qty: 1 }];
    });
  };

  const handleQtyChange = (id, delta) => {
    setPreOrderItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const handleSubmitOrder = () => {
    if (preOrderItems.length === 0) return;
    onSubmit(preOrderItems);
  };

  const itemCount = useMemo(
    () => preOrderItems.reduce((sum, item) => sum + item.qty, 0),
    [preOrderItems]
  );

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="pos-popup" onClick={(e) => e.stopPropagation()}>
        <div className="pos-header">
          <h2>Đặt món ăn</h2>
          <button onClick={onClose} className="close-btn" aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="pos-body">
          {/* Menu Section */}
          <div className="pos-menu">
            <div className="category-sidebar">
              <h3 className="section-title">Danh mục</h3>
              <ul>
                {categories.map((category) => (
                  <li
                    key={category}
                    className={`category-item ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </div>

            <div className="menu-content">
              <div className="menu-grid">
                {filteredDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="menu-card"
                    onClick={() => handleAddToPreOrder(dish)}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="menu-img"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                    <div className="menu-info">
                      <div className="menu-name">{dish.name}</div>
                      <div className="menu-price">
                        {dish.price.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="pos-cart">
            <h3 className="section-title">
              Món đã chọn {itemCount > 0 && (
                <span className="item-count">({itemCount})</span>
              )}
            </h3>

            {preOrderItems.length === 0 ? (
              <div className="empty-cart">
                <svg
                  className="empty-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <p>Chưa có món nào</p>
              </div>
            ) : (
              <ul className="cart-list">
                {preOrderItems.map((item) => (
                  <li key={item.id} className="cart-item">
                    <div className="cart-info">
                      <strong>{item.name}</strong>
                      <span className="item-subtotal">
                        {(item.price * item.qty).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="cart-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQtyChange(item.id, -1);
                        }}
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <span className="qty-display">{item.qty}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQtyChange(item.id, 1);
                        }}
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="cart-summary">
              <div className="cart-total">
                <span>Tổng cộng:</span>
                <strong>{total.toLocaleString("vi-VN")}đ</strong>
              </div>
              <button
                onClick={handleSubmitOrder}
                className="pay-btn"
                disabled={preOrderItems.length === 0}
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


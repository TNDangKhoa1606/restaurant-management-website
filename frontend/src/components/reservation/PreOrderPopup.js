import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import './PreOrderPopup.css';

export const mockMenu = [
  // Việt Nam
  { id: 1, name: "Gỏi cuốn tôm thịt", price: 65000, category: "Khai vị", image: "/img/goi_cuon_tom_thit.jpg" },
  { id: 2, name: "Chả giò hải sản", price: 75000, category: "Khai vị", image: "/img/cha_gio_hai_san.jpg" },
  { id: 3, name: "Salad dầu giấm", price: 55000, category: "Khai vị", image: "/img/salad_dau_giam.jpg" },
  { id: 4, name: "Súp cua", price: 45000, category: "Khai vị", image: "/img/sup_cua.jpg" },
  // Nhật Bản
  { id: 5, name: "Phở bò tái", price: 70000, category: "Món chính", image: "/img/pho_bo_tai.jpg" },
  { id: 6, name: "Bún chả Hà Nội", price: 65000, category: "Món chính", image: "/img/bun_cha_ha_noi.jpg" },
  { id: 7, name: "Cơm tấm sườn bì chả", price: 75000, category: "Món chính", image: "/img/com_tam_suon_bi_cha.jpg" },
  { id: 8, name: "Bò lúc lắc", price: 120000, category: "Món chính", image: "/img/bo_luc_lac.jpg" },
  // Hàn Quốc
  { id: 9, name: "Cá diêu hồng hấp xì dầu", price: 180000, category: "Món chính", image: "/img/ca_dieu_hong_hap_xi_dau.jpg" },
  { id: 10, name: "Lẩu Thái Tomyum", price: 350000, category: "Món chính", image: "/img/lau_thai_tomyum.jpg" },
  { id: 11, name: "Steak bò Mỹ", price: 450000, category: "Món chính", image: "/img/steak_bo_my.jpg" },
  // Quốc tế khác
  { id: 12, name: "Chè khúc bạch", price: 35000, category: "Tráng miệng", image: "/img/che_khuc_bach.jpg" },
  { id: 13, name: "Bánh flan", price: 25000, category: "Tráng miệng", image: "/img/banh_flan.jpg" },
  { id: 14, name: "Rau câu dừa", price: 20000, category: "Tráng miệng", image: "/img/rau_cau_dua.jpg" },
  { id: 15, name: "Nước chanh", price: 30000, category: "Đồ uống", image: "/img/nuoc_chanh.jpg" },
  { id: 16, name: "Nước cam ép", price: 40000, category: "Đồ uống", image: "/img/nuoc_cam_ep.jpg" },
  { id: 17, name: "Coca-Cola", price: 25000, category: "Đồ uống", image: "/img/coca_cola.jpg" },
  { id: 18, name: "Bia Tiger", price: 35000, category: "Đồ uống", image: "/img/bia_tiger.jpg" },
  { id: 19, name: "Kim chi", price: 30000, category: "Món Ăn Kèm", image: "/img/kim_chi.jpg" },
  { id: 20, name: "Cơm trắng", price: 15000, category: "Món Ăn Kèm", image: "/img/com_trang.jpg" },

];

export default function PreOrderPopup({ onClose, onSubmit, initialItems }) {
  const [preOrderItems, setPreOrderItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMenu = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get("/api/menu");

        const normalized = [];

        if (data && Array.isArray(data.fullMenu)) {
          data.fullMenu.forEach((group) => {
            if (!group || !Array.isArray(group.items)) {
              return;
            }
            group.items.forEach((item) => {
              normalized.push({
                id: item.id,
                name: item.name,
                price: item.price,
                category: group.category,
                image: item.image,
              });
            });
          });
        }

        if (data && Array.isArray(data.sideMenu)) {
          data.sideMenu.forEach((group) => {
            if (!group || !Array.isArray(group.items)) {
              return;
            }
            group.items.forEach((item) => {
              normalized.push({
                id: item.id,
                name: item.name,
                price: item.price,
                category: group.category,
                image: item.image,
              });
            });
          });
        }

        if (isMounted) {
          setMenuItems(normalized.length ? normalized : mockMenu);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching menu for pre-order:", err);
          setError(
            err.response?.data?.message ||
              "Không thể tải thực đơn. Đang sử dụng dữ liệu tạm thời."
          );
          setMenuItems(mockMenu);
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

  useEffect(() => {
    if (!initialItems || !Array.isArray(initialItems) || !initialItems.length) {
      return;
    }

    setPreOrderItems(
      initialItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty || 1,
        category: item.category || item.categoryName || '',
        image: item.image || '',
      }))
    );
  }, [initialItems]);

  const categories = useMemo(
    () => [
      "Tất cả",
      ...new Set(
        menuItems
          .map((item) => item.category)
          .filter((category) => category && typeof category === "string")
      ),
    ],
    [menuItems]
  );

  const filteredDishes = useMemo(
    () =>
      selectedCategory === "Tất cả"
        ? menuItems
        : menuItems.filter((dish) => dish.category === selectedCategory),
    [selectedCategory, menuItems]
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
              {loading && (
                <div className="menu-loading">Đang tải thực đơn...</div>
              )}
              {error && !loading && (
                <div className="menu-error">{error}</div>
              )}
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


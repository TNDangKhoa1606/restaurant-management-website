import React from 'react';
import { Link } from 'react-router-dom';

// --- Dữ liệu giả lập ---
const menuItems = [
    { id: 1, name: 'Phở Bò Tái', image: 'https://via.placeholder.com/100x70.png?text=Pho+Bo', category: 'Món nước', price: 50000, status: 'available' },
    { id: 2, name: 'Bún Chả Hà Nội', image: 'https://via.placeholder.com/100x70.png?text=Bun+Cha', category: 'Món khô', price: 45000, status: 'available' },
    { id: 3, name: 'Nem Rán', image: 'https://via.placeholder.com/100x70.png?text=Nem+Ran', category: 'Món ăn vặt', price: 30000, status: 'unavailable' },
    { id: 4, name: 'Cơm Rang Dưa Bò', image: 'https://via.placeholder.com/100x70.png?text=Com+Rang', category: 'Món cơm', price: 55000, status: 'available' },
];

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

function MenuManagement() {

    const handleAddItem = () => {
        // Logic để mở form/modal thêm món sẽ ở đây
        alert('Mở form thêm món mới!');
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý thực đơn</h2>
                <div className="filters">
                    <select className="role-filter">
                        <option value="">Tất cả loại món</option>
                        <option value="mon-nuoc">Món nước</option>
                        <option value="mon-kho">Món khô</option>
                        <option value="mon-com">Món cơm</option>
                        <option value="mon-an-vat">Món ăn vặt</option>
                    </select>
                    <select className="role-filter">
                        <option value="">Tất cả trạng thái</option>
                        <option value="available">Còn hàng</option>
                        <option value="unavailable">Hết hàng</option>
                    </select>
                    <button onClick={handleAddItem} className="btn-admin btn-admin-primary">
                        Thêm món
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th>Tên món</th>
                            <th>Loại món</th>
                            <th>Giá</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menuItems.map(item => (
                            <tr key={item.id}>
                                <td><img src={item.image} alt={item.name} className="menu-item-image" /></td>
                                <td>{item.name}</td>
                                <td>{item.category}</td>
                                <td>{formatPrice(item.price)}</td>
                                <td>
                                    <span className={`status-badge ${item.status === 'available' ? 'status-active' : 'status-inactive'}`}>
                                        {item.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="action-btn btn-edit">Sửa</button>
                                    <button className="action-btn btn-delete">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MenuManagement;
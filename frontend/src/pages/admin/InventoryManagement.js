import React, { useState } from 'react';

// --- Dữ liệu giả lập ---
const ingredients = [
    { id: 1, name: 'Thịt bò', stock: 5, unit: 'kg', warningLevel: 10 },
    { id: 2, name: 'Hành tây', stock: 20, unit: 'kg', warningLevel: 15 },
    { id: 3, name: 'Phở khô', stock: 50, unit: 'gói', warningLevel: 20 },
    { id: 4, name: 'Tương ớt', stock: 4, unit: 'chai', warningLevel: 5 },
    { id: 5, name: 'Dầu ăn', stock: 8, unit: 'lít', warningLevel: 10 },
];

const menuItems = [
    { id: 1, name: 'Phở Bò Tái', image: 'https://via.placeholder.com/100x70.png?text=Pho+Bo', category: 'Món nước', price: 50000, status: 'available' },
    { id: 2, name: 'Bún Chả Hà Nội', image: 'https://via.placeholder.com/100x70.png?text=Bun+Cha', category: 'Món khô', price: 45000, status: 'available' },
    { id: 3, name: 'Nem Rán', image: 'https://via.placeholder.com/100x70.png?text=Nem+Ran', category: 'Món ăn vặt', price: 30000, status: 'unavailable' },
    { id: 4, name: 'Cơm Rang Dưa Bò', image: 'https://via.placeholder.com/100x70.png?text=Com+Rang', category: 'Món cơm', price: 55000, status: 'available' },
];

const supplies = [
    { id: 1, name: 'Hộp đựng mang về', stock: 100, unit: 'cái', type: 'Đóng gói' },
    { id: 2, name: 'Đũa dùng 1 lần', stock: 500, unit: 'đôi', type: 'Dụng cụ ăn uống' },
    { id: 3, 'name': 'Túi nilon', stock: 250, unit: 'cái', type: 'Đóng gói' },
    { id: 4, 'name': 'Nước rửa chén', stock: 5, unit: 'chai', type: 'Vệ sinh' },
];

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

function InventoryManagement() {
    const [activeTab, setActiveTab] = useState('ingredients');

    const handleAction = (action) => {
        alert(`Thực hiện hành động: ${action}`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dishes':
                return (
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
                );
            case 'supplies':
                return (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tên vật tư</th>
                                <th>Số lượng tồn</th>
                                <th>Đơn vị</th>
                                <th>Loại vật tư</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {supplies.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.stock}</td>
                                    <td>{item.unit}</td>
                                    <td>{item.type}</td>
                                    <td className="actions-cell">
                                        <button className="action-btn btn-edit">Sửa</button>
                                        <button className="action-btn btn-delete">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'ingredients':
            default:
                return (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tên nguyên liệu</th>
                                <th>Số lượng tồn</th>
                                <th>Đơn vị</th>
                                <th>Mức cảnh báo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients.map(item => (
                                <tr key={item.id} className={item.stock < item.warningLevel ? 'low-stock-warning' : ''}>
                                    <td>{item.name}</td>
                                    <td>{item.stock}</td>
                                    <td>{item.unit}</td>
                                    <td>{item.warningLevel}</td>
                                    <td className="actions-cell">
                                        <button className="action-btn btn-edit">Sửa</button>
                                        <button className="action-btn btn-delete">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
        }
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý kho</h2>
                <div className="admin-tabs">
                    <button onClick={() => setActiveTab('ingredients')} className={`btn-admin ${activeTab === 'ingredients' ? 'btn-admin-primary' : 'btn-admin-secondary'}`} style={{ marginRight: '10px' }}>Nguyên liệu</button>
                    <button onClick={() => setActiveTab('dishes')} className={`btn-admin ${activeTab === 'dishes' ? 'btn-admin-primary' : 'btn-admin-secondary'}`} style={{ marginRight: '10px' }}>Món ăn</button>
                    <button onClick={() => setActiveTab('supplies')} className={`btn-admin ${activeTab === 'supplies' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}>Vật tư</button>
                </div>
            </div>

            <div className="admin-table-container">
                <div className="filters" style={{ marginBottom: '20px' }}>
                    {activeTab === 'ingredients' && <button onClick={() => handleAction('Nhập nguyên liệu')} className="btn-admin btn-admin-primary">Nhập nguyên liệu</button>}
                    {activeTab === 'dishes' && <button onClick={() => handleAction('Thêm món')} className="btn-admin btn-admin-primary">Thêm món</button>}
                    {activeTab === 'supplies' && <button onClick={() => handleAction('Nhập vật tư')} className="btn-admin btn-admin-primary">Nhập vật tư</button>}
                </div>
                {renderContent()}
            </div>
        </div>
    );
}

export default InventoryManagement;
import React from 'react';

// --- Dữ liệu giả lập ---
const ingredients = [
    { id: 1, name: 'Thịt bò', stock: 5, unit: 'kg', warningLevel: 10 },
    { id: 2, name: 'Hành tây', stock: 20, unit: 'kg', warningLevel: 15 },
    { id: 3, name: 'Phở khô', stock: 50, unit: 'gói', warningLevel: 20 },
    { id: 4, name: 'Tương ớt', stock: 15, unit: 'chai', warningLevel: 5 },
    { id: 5, name: 'Dầu ăn', stock: 8, unit: 'lít', warningLevel: 10 },
];

function InventoryManagement() {

    const handleAction = (action) => {
        alert(`Thực hiện hành động: ${action}`);
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý kho nguyên liệu</h2>
                <div className="filters">
                    <button onClick={() => handleAction('Nhập kho')} className="btn-admin btn-admin-primary">Nhập kho</button>
                    <button onClick={() => handleAction('Xuất kho')} className="btn-admin btn-admin-secondary">Xuất kho</button>
                </div>
            </div>

            <div className="admin-table-container">
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
            </div>
        </div>
    );
}

export default InventoryManagement;
import React from 'react';

// --- Dữ liệu giả lập ---
const tables = [
    { id: 1, name: 'Bàn 1', status: 'available' },
    { id: 2, name: 'Bàn 2', status: 'occupied' },
    { id: 3, name: 'Bàn 3', status: 'available' },
    { id: 4, name: 'Bàn 4', status: 'available' },
    { id: 5, name: 'Bàn 5', status: 'occupied' },
    { id: 6, name: 'Bàn 6', status: 'occupied' },
    { id: 7, name: 'Bàn 7', status: 'available' },
    { id: 8, name: 'Bàn 8', status: 'available' },
];

function TableManagement() {

    const handleAction = (action) => {
        alert(`Thực hiện hành động: ${action}`);
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Sơ đồ bàn ăn</h2>
                <div className="filters">
                    <button onClick={() => handleAction('Thêm bàn')} className="btn-admin btn-admin-primary">Thêm bàn</button>
                    <button onClick={() => handleAction('Ghép bàn')} className="btn-admin btn-admin-secondary">Ghép bàn</button>
                    <button onClick={() => handleAction('Chỉnh sửa')} className="btn-admin btn-admin-secondary">Chỉnh sửa bàn</button>
                </div>
            </div>

            <div className="table-grid-container">
                {tables.map(table => (
                    <div key={table.id} className={`table-card ${table.status === 'available' ? 'status-available' : 'status-occupied'}`}>
                        <div className="table-card-icon">
                            {/* Placeholder for table icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.981V18z" />
                            </svg>
                        </div>
                        <div className="table-card-name">{table.name}</div>
                        <div className="table-card-status">
                            {table.status === 'available' ? 'Trống' : 'Đang sử dụng'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TableManagement;
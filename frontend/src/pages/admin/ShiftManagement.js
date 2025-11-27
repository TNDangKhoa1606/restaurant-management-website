import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../pages/AuthContext';

const formatDateForInput = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    return new Date(date).toISOString().split('T')[0];
};

function ShiftManagement() {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(formatDateForInput());
    const { token, loading: authLoading } = useAuth();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const fetchShifts = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const config = {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { date: selectedDate }
            };
            // API này cần được tạo ở backend
            const { data } = await axios.get('/api/shifts', config);
            setShifts(data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách ca làm việc.');
        } finally {
            setLoading(false);
        }
    }, [token, selectedDate]);

    useEffect(() => {
        if (!authLoading) {
            fetchShifts();
        }
    }, [authLoading, fetchShifts]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDate]);

    const handleAddShift = () => {
        // Logic để mở modal sẽ được thêm ở đây
        alert('Mở modal thêm ca làm việc!');
    };

    const handleAction = (action, shiftId) => {
        alert(`Thực hiện: ${action} cho ca làm ID ${shiftId}`);
    };

    const totalItems = shifts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const paginatedShifts = shifts.slice(startIndex, startIndex + pageSize);

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý ca làm việc</h2>
                <div className="filters">
                    <input 
                        type="date" 
                        className="date-filter" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <button onClick={handleAddShift} className="btn-admin btn-admin-primary">
                        Thêm ca
                    </button>
                </div>
            </div>

            {loading && <p>Đang tải dữ liệu ca làm...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tên ca</th>
                            <th>Thời gian</th>
                            <th>Nhân viên</th>
                            <th>Ghi chú</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shifts.length > 0 ? paginatedShifts.map(shift => (
                            <tr key={shift.shift_id}>
                                <td>{shift.shift_name}</td>
                                <td>{shift.start_time} - {shift.end_time}</td>
                                <td className="employee-avatar-group">
                                    {shift.employees && shift.employees.map(emp => (
                                        <img 
                                            key={emp.employee_id} 
                                            src={emp.avatar_url || `https://i.pravatar.cc/150?u=${emp.employee_id}`} 
                                            alt={emp.employee_name} 
                                            title={emp.employee_name} 
                                        />
                                    ))}
                                </td>
                                <td>{shift.notes || 'Không có'}</td>
                                <td className="actions-cell">
                                    <button onClick={() => handleAction('Sửa', shift.shift_id)} className="action-btn btn-edit">Sửa</button>
                                    <button onClick={() => handleAction('Xóa', shift.shift_id)} className="action-btn btn-delete">Xóa</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>Không có ca làm việc nào cho ngày đã chọn.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {shifts.length > 0 && (
                    <div className="admin-pagination">
                        <div className="admin-pagination-info">
                            Hiển thị {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} trên {totalItems} kết quả
                        </div>
                        <div className="admin-pagination-controls">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={safeCurrentPage === 1}
                            >
                                Trước
                            </button>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={safeCurrentPage === index + 1 ? 'active' : ''}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={safeCurrentPage === totalPages}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
            )}
        </div>
    );
}

export default ShiftManagement;
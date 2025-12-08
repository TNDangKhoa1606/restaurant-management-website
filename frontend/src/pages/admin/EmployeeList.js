import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../pages/AuthContext';
import EmployeeModal from '../../components/admin/EmployeeModal'; // Import the modal
import { useNotification } from '../../components/common/NotificationContext';

const getRoleText = (role) => {
    switch (role) {
        case 'Admin': return 'Quản lý';
        case 'Staff': return 'Phục vụ';
        case 'Kitchen': return 'Bếp';
        case 'Cashier': return 'Thu ngân';
        case 'Receptionist': return 'Lễ tân';
        default: return role;
    }
};

function EmployeeList() {
    const [employees, setEmployees] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, loading: authLoading } = useAuth();
    const { confirm, notify } = useNotification();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // State for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const fetchEmployees = useCallback(async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            const { data } = await axios.get(
                `/api/users/staff?keyword=${searchTerm}&role=${roleFilter}`,
                config
            );
            setEmployees(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách nhân viên.');
        } finally {
            setLoading(false);
        }
    }, [token, searchTerm, roleFilter]); // Dependencies for useCallback

    useEffect(() => {
        const timerId = setTimeout(() => {
            if (!authLoading && token) {
                setLoading(true);
                fetchEmployees();
            } else if (!authLoading && !token) {
                setLoading(false);
                setError("Vui lòng đăng nhập để xem dữ liệu.");
            }
        }, 500);

        return () => clearTimeout(timerId);
    }, [authLoading, token, fetchEmployees]); // Add fetchEmployees to dependency array

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleUpdateEmployee = async (updatedData) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            // The API endpoint should be for updating a specific user, e.g., /api/users/:id
            const { data } = await axios.put(`/api/users/${updatedData.id}`, updatedData, config);
            
            // Update the employee list with the new data
            setEmployees(employees.map(emp => emp.id === updatedData.id ? data : emp));
            
            handleCloseModal();
            notify('Cập nhật thông tin nhân viên thành công!', 'success');
        } catch (err) {
            notify(err.response?.data?.message || 'Không thể cập nhật thông tin nhân viên.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Xóa nhân viên',
            message: 'Bạn có chắc chắn muốn xóa nhân viên này không? Hành động này không thể hoàn tác.',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.delete(`/api/users/${id}`, config);
            setEmployees(employees.filter(emp => emp.id !== id));
            notify('Xóa nhân viên thành công!', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa nhân viên.');
        }
    };


    if (loading) {
        return <div className="admin-list-container">Đang tải danh sách nhân viên...</div>;
    }

    if (error) {
        return <div className="admin-list-container alert alert-danger">{error}</div>;
    }

    const totalItems = employees.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const paginatedEmployees = employees.slice(startIndex, startIndex + pageSize);

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Danh sách nhân viên</h2>
                <div className="filters">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên, email, SĐT..." 
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select className="role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">Tất cả vai trò</option>
                        <option value="Admin">Quản lý (Admin)</option>
                        <option value="Staff">Phục vụ (Staff)</option>
                        <option value="Kitchen">Bếp</option>
                        <option value="Receptionist">Lễ tân (Receptionist)</option>
                        <option value="Cashier">Thu ngân (Cashier)</option>
                    </select>
                    <Link to="/admin/create-account" className="btn-admin btn-admin-primary">
                        Thêm nhân viên
                    </Link>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length > 0 ? paginatedEmployees.map(emp => (
                            <tr key={emp.id}>
                                <td>{emp.name}</td>
                                <td>{emp.email}</td>
                                <td>{emp.phone}</td>
                                <td>{getRoleText(emp.role)}</td>
                                <td>
                                    <span className={`status-badge ${emp.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                                        {emp.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button onClick={() => handleEdit(emp)} className="action-btn btn-edit">Chỉnh sửa</button>
                                    <button onClick={() => handleDelete(emp.id)} className="action-btn btn-delete">Xóa</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>Không có nhân viên nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {employees.length > 0 && (
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

            <EmployeeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleUpdateEmployee}
                employee={selectedEmployee}
            />
        </div>
    );
}

export default EmployeeList;
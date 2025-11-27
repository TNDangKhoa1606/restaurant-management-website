import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext'; // Import hook useAuth thay vì AuthContext

function CreateAccount() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { token } = useAuth(); // Sử dụng hook useAuth() để lấy token
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu và xác nhận mật khẩu không khớp.');
            return;
        }

        setLoading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            // API endpoint này cần được tạo ở backend
            const response = await axios.post('/api/users/create-staff', formData, config);

            setSuccess(response.data.message);
            setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: '' });
            setTimeout(() => {
                navigate('/admin/employees'); // Chuyển hướng đến trang quản lý nhân viên
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-container">
            <h2 className="admin-form-title">Tạo tài khoản nhân viên mới</h2>
            {success ? (
                <div className="form-success-message">
                    <i className="fas fa-check-circle"></i>
                    <h3>Thành công!</h3>
                    <p>{success}</p>
                    <p>Đang chuyển hướng đến trang danh sách nhân viên...</p>
                </div>
            ) : (
                <form className="admin-form" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-grid">
                    {/* Row 1 */}
                    <div className="form-group">
                        <label htmlFor="name">Họ và tên</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Nhập họ và tên" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Nhập địa chỉ email" required />
                    </div>

                    {/* Row 2 */}
                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Nhập số điện thoại" required />
                    </div>

                    {/* Row 3 */}
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Nhập mật khẩu (ít nhất 6 ký tự)" required />
                        <div className="password-strength">
                            {/* Placeholder for password strength indicator */}
                            <div className="strength-bar"></div>
                            <span>Mật khẩu yếu</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" required />
                    </div>

                    {/* Row 4 */}
                    <div className="form-group form-group-full">
                        <label htmlFor="role">Vai trò</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} required>
                            <option value="">Chọn vai trò</option>
                            <option value="Admin">Quản lý (Admin)</option>
                            <option value="Waiter">Phục vụ (Waiter)</option>
                            <option value="Kitchen">Bếp (Kitchen)</option>
                            <option value="Receptionist">Lễ tân (Receptionist)</option>
                        </select>
                        <small className="form-hint">Chỉ Admin được tạo tài khoản nhân viên.</small>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-admin btn-admin-primary" disabled={loading}>{loading ? 'Đang xử lý...' : 'Tạo tài khoản'}</button>
                    <Link to="/admin/dashboard" className="btn-admin btn-admin-secondary">Hủy</Link>
                </div>
                </form>
            )}
        </div>
    );
}

export default CreateAccount;
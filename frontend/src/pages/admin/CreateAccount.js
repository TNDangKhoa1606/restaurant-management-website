import React from 'react';
import { Link } from 'react-router-dom';

function CreateAccount() {
    return (
        <div className="admin-form-container">
            <h2 className="admin-form-title">Tạo tài khoản nhân viên mới</h2>
            <form className="admin-form">
                <div className="form-grid">
                    {/* Row 1 */}
                    <div className="form-group">
                        <label htmlFor="fullName">Họ và tên</label>
                        <input type="text" id="fullName" name="fullName" placeholder="Nhập họ và tên" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="Nhập địa chỉ email" required />
                    </div>

                    {/* Row 2 */}
                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input type="tel" id="phone" name="phone" placeholder="Nhập số điện thoại" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input type="text" id="username" name="username" placeholder="Nhập tên đăng nhập" required />
                    </div>

                    {/* Row 3 */}
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input type="password" id="password" name="password" placeholder="Nhập mật khẩu" required />
                        <div className="password-strength">
                            {/* Placeholder for password strength indicator */}
                            <div className="strength-bar"></div>
                            <span>Mật khẩu yếu</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Nhập lại mật khẩu" required />
                    </div>

                    {/* Row 4 */}
                    <div className="form-group form-group-full">
                        <label htmlFor="role">Vai trò</label>
                        <select id="role" name="role" required>
                            <option value="">Chọn vai trò</option>
                            <option value="admin">Quản lý (Admin)</option>
                            <option value="staff">Nhân viên phục vụ (Staff)</option>
                            <option value="kitchen">Bếp (Kitchen)</option>
                            <option value="cashier">Thu ngân (Cashier)</option>
                        </select>
                        <small className="form-hint">Chỉ Admin được tạo tài khoản nhân viên.</small>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-admin btn-admin-primary">Tạo tài khoản</button>
                    <Link to="/admin/dashboard" className="btn-admin btn-admin-secondary">Hủy</Link>
                </div>
            </form>
        </div>
    );
}

export default CreateAccount;
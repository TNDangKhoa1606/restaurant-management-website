import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext'; // Import useAuth
import { useNotification } from '../../components/common/NotificationContext';

const ProfileInfo = () => {
	const { user, token, isAuthenticated, login } = useAuth(); // Lấy thông tin người dùng từ context
	const { notify } = useNotification();
	const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		// Cập nhật form khi có thông tin người dùng từ context
		if (user) {
			setFormData({
				name: user.name || '',
				email: user.email || '',
				phone: user.phone || '', // Xử lý trường hợp phone không có
			});
		}
	}, [user]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isAuthenticated || !token) {
			notify('Vui lòng đăng nhập để cập nhật thông tin cá nhân.', 'warning');
			return;
		}

		const name = (formData.name || '').trim();
		const phone = (formData.phone || '').trim();
		const email = (formData.email || '').trim();

		if (!name || !email || !phone) {
			notify('Vui lòng nhập đầy đủ họ tên, email và số điện thoại.', 'warning');
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			notify('Vui lòng nhập địa chỉ email hợp lệ.', 'warning');
			return;
		}

		try {
			setIsSubmitting(true);
			const config = { headers: { Authorization: `Bearer ${token}` } };
			const body = { name, phone, email };

			const response = await axios.put('/api/auth/me', body, config);
			const updatedUser = response.data && response.data.user;

			if (updatedUser) {
				login(updatedUser, token);
				setFormData({
					name: updatedUser.name || '',
					email: updatedUser.email || '',
					phone: updatedUser.phone || '',
				});
			}

			notify('Cập nhật thông tin cá nhân thành công.', 'success');
		} catch (error) {
			const message = error.response?.data?.message || 'Cập nhật thông tin cá nhân thất bại. Vui lòng thử lại.';
			notify(message, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="content-section">
			<h2 className="content-title">Thông tin cá nhân</h2>
			<p className="content-subtitle">Quản lý thông tin cá nhân của bạn để bảo mật tài khoản.</p>

			<form className="profile-form" onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="name">Họ và Tên</label>
					<input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="form-control" />
				</div>
				<div className="form-group">
					<label htmlFor="email">Email</label>
					<input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="form-control" />
				</div>
				<div className="form-group">
					<label htmlFor="phone">Số điện thoại</label>
					<input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="form-control" />
				</div>
				<button type="submit" className="btn-save-profile" disabled={isSubmitting}>
					{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
				</button>
			</form>
		</div>
	);
};

export default ProfileInfo;
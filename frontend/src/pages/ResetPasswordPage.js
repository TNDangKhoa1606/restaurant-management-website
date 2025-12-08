import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../components/common/NotificationContext';
import sliderImage from '../assets/images/brlogin.jpg'; // Tái sử dụng ảnh nền

function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();
    const { notify } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccess('');
        setError('');

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/reset-password/${token}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đã có lỗi xảy ra. Token có thể đã hết hạn.');
            }

            const baseMessage = data.message || 'Đặt lại mật khẩu thành công.';
            setSuccess(baseMessage + ' Bạn sẽ được chuyển đến trang đăng nhập sau vài giây.');
            notify(baseMessage, 'success');
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.message);
            notify(err.message || 'Đã có lỗi xảy ra. Token có thể đã hết hạn.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${sliderImage})` }}>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            <div className="relative z-10 bg-black/20 backdrop-blur-lg p-8 rounded-lg shadow-2xl w-full max-w-md animate-fadeInUp opacity-0" style={{ animationFillMode: 'forwards' }}>
                <h1 className="text-3xl font-bold text-center text-white mb-8">Đặt lại mật khẩu</h1>

                <form onSubmit={handleSubmit}>
                    <div className="relative mb-4">
                        <input type="password" placeholder="Mật khẩu mới" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black/20 text-white placeholder-gray-400 py-2 pl-4 pr-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div className="relative mb-6">
                        <input type="password" placeholder="Xác nhận mật khẩu mới" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-black/20 text-white placeholder-gray-400 py-2 pl-4 pr-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>

                    <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50" disabled={isLoading}>
                        {isLoading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                    </button>

                    {/* Chỉ hiển thị lỗi; thông báo thành công đã dùng popup notify */}
                    {error && <div className="mt-4 bg-red-500/30 border border-red-500 text-white px-4 py-3 rounded-md" role="alert">
                        <p>{error}</p>
                    </div>}
                </form>

                {!success && (
                    <div className="text-center mt-6">
                        <Link to="/login" className="text-sm text-primary hover:underline">Quay về trang đăng nhập</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResetPasswordPage;
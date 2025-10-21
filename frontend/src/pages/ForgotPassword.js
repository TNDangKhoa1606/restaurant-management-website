import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import sliderImage from '../assets/images/brlogin.jpg'; // Import ảnh nền

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Logic xử lý gửi email đặt lại mật khẩu (giả lập)
        // Trong thực tế, bạn sẽ gọi API ở đây
        console.log('Yêu cầu đặt lại mật khẩu cho email:', email);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Giả lập độ trễ mạng

        setIsLoading(false);
        setMessage('Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một liên kết để đặt lại mật khẩu.');
        setEmail('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${sliderImage})` }}>
            {/* Lớp phủ */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            <div className="relative z-10 bg-black/20 backdrop-blur-lg p-8 rounded-lg shadow-2xl w-full max-w-md animate-fadeInUp opacity-0" style={{ animationFillMode: 'forwards' }}>
                <h1 className="text-3xl font-bold text-center text-white mb-2">Quên mật khẩu</h1>
                <p className="text-center text-gray-300 mb-8">Nhập email của bạn để nhận liên kết đặt lại.</p>

                <form onSubmit={handleSubmit}>
                    {/* Trường nhập Email */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black/20 text-white placeholder-gray-400 py-2 pl-10 pr-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>

                    {/* Nút Gửi */}
                    <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Gửi liên kết'}
                    </button>

                    {/* Khu vực thông báo */}
                    {message && <div className="mt-4 bg-green-500/30 border border-green-500 text-white px-4 py-3 rounded-md" role="alert">
                        <p>{message}</p>
                    </div>}
                </form>

                {/* Liên kết ngoài form */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-300">Nhớ lại mật khẩu? <Link to="/login" className="font-medium text-primary hover:underline">Đăng nhập</Link></p>
                    <p className="mt-2">
                        <Link to="/" className="text-sm text-primary hover:underline">Quay về trang chủ</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;


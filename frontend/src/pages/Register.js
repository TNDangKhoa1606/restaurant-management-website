import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import sliderImage from '../assets/images/brlogin.jpg'; // Import ảnh nền

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đã có lỗi xảy ra.');
            }

            setSuccess('Đăng ký tài khoản thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${sliderImage})` }}>
            {/* Lớp phủ */}
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>

            <div className="relative z-10 bg-black/20 backdrop-blur-lg p-8 rounded-lg shadow-2xl w-full max-w-md animate-fadeInUp opacity-0" style={{ animationFillMode: 'forwards' }}>
                <h1 className="text-3xl font-bold text-center text-white mb-2">Tạo tài khoản mới</h1>
                <p className="text-center text-gray-300 mb-8">Vui lòng điền đầy đủ thông tin</p>

                <form onSubmit={handleSubmit}>
                    {/* Trường nhập Họ và tên */}
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        </div>
                        <input type="text" placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-black/20 text-white placeholder-gray-400 py-2 pl-10 pr-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>

                    {/* Trường nhập Email */}
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black/20 text-white placeholder-gray-400 py-2 pl-10 pr-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>

                    {/* Trường nhập Mật khẩu */}
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                        <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black/20 text-white placeholder-gray-400 py-2 pl-10 pr-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>

                    {/* Trường nhập Xác nhận mật khẩu */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                        <input type="password" placeholder="Xác nhận mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-black/20 text-white placeholder-gray-400 py-2 pl-10 pr-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>

                    {/* Nút Đăng ký */}
                    <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>

                    {/* Khu vực báo lỗi và thành công */}
                    {error && <div className="mt-4 bg-red-500/30 border border-red-500 text-white px-4 py-3 rounded-md" role="alert">
                        <p>{error}</p>
                    </div>}
                    {success && <div className="mt-4 bg-green-500/30 border border-green-500 text-white px-4 py-3 rounded-md" role="alert">
                        <p>{success}</p>
                    </div>}
                </form>

                {/* Liên kết ngoài form */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-300">Đã có tài khoản? <Link to="/login" className="font-medium text-primary hover:underline">Đăng nhập</Link></p>
                    <p className="mt-2">
                        <Link to="/" className="text-sm text-primary hover:underline">Quay về trang chủ</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;

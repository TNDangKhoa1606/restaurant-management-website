
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AuthProvider, useAuth } from './pages/AuthContext';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import AdminRoute from './components/routing/AdminRoute'; // Import AdminRoute
import './App.css';
import axios from 'axios';
import Header from './components/common/Header';
import HeroSlider from './components/common/HeroSlider';
import ComboBanner from './components/common/ComboBanner';
import IntroductionSection from './components/common/IntroductionSection';
import MenuHighlightSection from './components/menu/MenuHighlightSection';
import RestaurantInfoSection from './components/common/RestaurantInfoSection';
import PageBanner from './components/common/PageBanner';
import MenuDisplay from './components/menu/MenuDisplay';
import Footer from './components/common/Footer';
import Cart from './components/cart/Cart';
import MenuPage from './pages/MenuPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/ServicesPage'; // Sửa lại đường dẫn import cho đúng
import blogBannerImage from './assets/images/banner-.jpg'; 
import contactBannerImage from './assets/images/banner-02.jpg'; 
import BackToTop from './components/common/BackToTop';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Reservation from './pages/Reservation';
import UserProfile from './pages/profile/UserProfile';
import ReservationHistory from './pages/profile/ReservationHistory';
import ProfileInfo from './pages/profile/ProfileInfo';
import AddressBook from './pages/profile/AddressBook'; // Import component mới
import ChangePassword from './pages/profile/ChangePassword'; // Import component mới
import TableMenu from './pages/TableMenu';
import DashboardLayout from './layouts/DashboardLayout'; // Import layout chung mới
import TableMap from './pages/staff/serve/TableMap'; // Sửa đường dẫn import
import ReservationManagement from './pages/staff/receptionist/ReservationManagement'; // Sửa đường dẫn
import KitchenOrders from './pages/staff/kitchen/KitchenOrders'; // Giữ đường dẫn đúng
import Dashboard from './pages/admin/Dashboard';
import CreateAccount from './pages/admin/CreateAccount';
import EmployeeList from './pages/admin/EmployeeList';
import RolePermissions from './pages/admin/RolePermissions';
import ShiftManagement from './pages/admin/ShiftManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import SalesReport from './pages/admin/SalesReport';
import OrderManagement from './pages/admin/OrderManagement'; // Thêm import
import CustomerManagement from './pages/admin/CustomerManagement'; // Thêm import
import VerifyEmailPage from './pages/VerifyEmailPage'; // Thêm trang xác thực email
import ResetPasswordPage from './pages/ResetPasswordPage'; // Thêm trang đặt lại mật khẩu
import GoogleAuthHandler from './pages/GoogleAuthHandler'; // Thêm trang xử lý Google Auth
import InternalLogin from './pages/InternalLogin'; // Import trang đăng nhập nội bộ
import CustomerHistory from './pages/admin/CustomerHistory';
import PaymentResult from './pages/PaymentResult';
import profileBannerImage from './assets/images/slider-1.jpg';

// --- Component để xử lý lỗi 401 một cách tập trung ---
// Component này phải được đặt bên trong <Router> để có thể dùng useNavigate
const AuthRequestInterceptor = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // useMemo để đảm bảo interceptor chỉ được thiết lập một lần
  useMemo(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      (error) => {
        // Kiểm tra nếu lỗi là 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
          console.log("Lỗi 401 từ Interceptor, tự động đăng xuất.");
          logout();
          navigate('/internal/login', { replace: true }); // Chuyển hướng về trang đăng nhập nội bộ
        }
        return Promise.reject(error);
      }
    );

    // Cleanup function để gỡ bỏ interceptor khi component unmount
    return () => axios.interceptors.response.eject(interceptor);
  }, [logout, navigate]);

  return children;
};

const ScrollToTop = () => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    const currentPath = location.pathname;

    const isProfileRoute = (path) => path.startsWith('/profile');

    if (isProfileRoute(prevPath) && isProfileRoute(currentPath)) {
      prevPathRef.current = currentPath;
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    prevPathRef.current = currentPath;
  }, [location.pathname]);

  return null;
};

// Component Layout chính cho các trang của khách hàng
const MainLayout = ({ cartItems, onCartOpen }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Xác định chi tiết (tiêu đề, ảnh) cho banner dựa trên đường dẫn
  const getBannerDetails = () => {
    const path = location.pathname;

    if (path.startsWith('/profile')) {
      return {
        title: 'Tài khoản',
        image: profileBannerImage,
      };
    }

    switch (path) {
      case '/menu':
        return { 
          title: 'Thực Đơn', 
          image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1' 
        };
      case '/reservation':
        return { 
          title: 'Đặt Bàn', 
          image: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1' 
        };
      case '/reservation-payment':
        return { 
          title: 'Thanh toán đặt bàn', 
          image: 'https://images.pexels.com/photos/5419233/pexels-photo-5419233.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1' 
        };
      case '/about':
        return { 
          title: 'Giới Thiệu', 
          image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1' 
        };
      case '/blog':
        return { 
          title: 'Bài Viết', 
          image: blogBannerImage 
        };
      case '/contact':
        return { 
          title: 'Liên Hệ', 
          image: contactBannerImage 
        };
      default:
        return { title: '', image: '' };
    }
  };

  const bannerDetails = getBannerDetails();

  return (
    <>
      <Header />
      {!isHomePage && bannerDetails.image && <PageBanner title={bannerDetails.title} image={bannerDetails.image} />}
      <main style={{ paddingTop: isHomePage ? '0' : '80px' }}>
        <div className="page-transition">
          <Outlet />
        </div>
      </main>
      <Footer />
      <BackToTop cartItems={cartItems} onCartOpen={onCartOpen} />
    </>
  );
};

// Component Trang chủ
const HomePage = () => (
  <>
    <HeroSlider />
    <ComboBanner />
    <IntroductionSection />
    <MenuHighlightSection />
    <MenuDisplay />
    <RestaurantInfoSection />
  </>
);

// --- Cấu hình cho các vai trò ---
const adminConfig = {
  roleName: 'Quản trị viên',
  avatarBgColor: 'e74c3c',
  navLinks: [
    { to: '/admin/dashboard', text: 'Dashboard', allowedRoles: ['admin'] }, // Báo cáo
    { to: '/admin/reservations', text: 'Quản lý Đặt bàn', allowedRoles: ['admin', 'receptionist'] }, // Quản lý
    { to: '/admin/tables', text: 'Quản lý Bàn ăn', allowedRoles: ['admin', 'waiter'] }, // Quản lý
    { to: '/admin/kitchen-orders', text: 'Món cần chế biến', allowedRoles: ['admin', 'kitchen'] }, // Màn hình bếp
    { to: '/admin/inventory', text: 'Quản lý Kho', allowedRoles: ['admin'] }, // Quản lý
    { to: '/admin/employees', text: 'Quản lý Nhân viên', allowedRoles: ['admin'] }, // Con người
    { to: '/admin/customers', text: 'Quản lý Khách hàng', allowedRoles: ['admin'] }, // Con người
    { to: '/admin/shifts', text: 'Quản lý Ca làm', allowedRoles: ['admin'] }, // Con người
    { to: '/admin/permissions', text: 'Phân quyền', allowedRoles: ['admin'] }, // Hệ thống
    { to: '/admin/create-account', text: 'Tạo tài khoản', allowedRoles: ['admin'] }, // Hệ thống
    { to: '/admin/reports', text: 'Thống kê doanh số', allowedRoles: ['admin'] },
  ],
  pageTitles: {
    '/admin': 'Dashboard',
    '/admin/dashboard': 'Dashboard',
    '/admin/employees': 'Danh sách nhân viên',
    '/admin/customers': 'Quản lý Khách hàng',
    '/admin/customer-history/:id': 'Lịch sử Khách hàng', // Thêm tiêu đề cho trang mới
    '/admin/create-account': 'Tạo tài khoản',
    '/admin/permissions': 'Phân quyền chức năng',
    '/admin/shifts': 'Quản lý ca làm việc',
    '/admin/tables': 'Quản lý bàn ăn',
    '/admin/kitchen-orders': 'Món cần chế biến',
    '/admin/reservations': 'Quản lý Đặt bàn',
    '/admin/inventory': 'Quản lý kho',
    '/admin/reports': 'Thống kê doanh số',
  }
};


function App() {
  // Lấy dữ liệu giỏ hàng từ localStorage khi ứng dụng khởi động
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Không thể đọc giỏ hàng từ localStorage", error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const prevCartItemsRef = useRef();

  // Lưu giỏ hàng vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    // Chỉ cập nhật localStorage nếu nội dung của cartItems thực sự thay đổi
    const prevCartItems = prevCartItemsRef.current;
    const cartItemsString = JSON.stringify(cartItems);
    if (cartItemsString !== prevCartItems) {
      localStorage.setItem('cartItems', cartItemsString);
      prevCartItemsRef.current = cartItemsString;
    }
  }, [cartItems]);

  const onAddToCart = (item) => {
    // Kiểm tra xem món ăn đã có trong giỏ hàng chưa
    const exist = cartItems.find((x) => x.id === item.id);
    if (exist) {
      // Nếu đã có, tăng số lượng lên 1
      setCartItems(
        cartItems.map((x) =>
          x.id === item.id ? { ...exist, qty: exist.qty + 1 } : x
        )
      );
    } else {
      // Nếu chưa có, thêm vào giỏ hàng với số lượng là 1
      setCartItems([...cartItems, { ...item, qty: 1 }]);
    }
  };

  const onRemoveFromCart = (item) => {
    const exist = cartItems.find((x) => x.id === item.id);
    if (exist.qty === 1) {
      // Nếu số lượng là 1, xóa khỏi giỏ hàng
      setCartItems(cartItems.filter((x) => x.id !== item.id));
    } else {
      // Nếu số lượng > 1, giảm đi 1
      setCartItems(
        cartItems.map((x) =>
          x.id === item.id ? { ...exist, qty: exist.qty - 1 } : x
        )
      );
    }
  };

  return (
    <AuthProvider>
      <Router>
        <AuthRequestInterceptor>
          <ScrollToTop />
          <div className={`App ${isCartOpen ? 'cart-open' : ''}`}>
            <Cart
              cartItems={cartItems}
              onAdd={onAddToCart}
              onRemove={onRemoveFromCart}
              onClose={() => setIsCartOpen(false)}
              isOpen={isCartOpen}
            />
            <Routes> 
              {/* Các trang không có Header/Footer */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<InternalLogin />} /> {/* Thêm route cho trang đăng nhập admin */}
              <Route path="/internal/login" element={<InternalLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/table/:tableId" element={<TableMenu />} />
              <Route path="/waiter/order/:tableId" element={<TableMenu />} />
              <Route path="/payment/result" element={<PaymentResult />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/google-auth-handler" element={<GoogleAuthHandler />} />

              {/* Các trang sử dụng Layout chính (có Header/Footer) */}
              <Route path="/" element={<MainLayout cartItems={cartItems} onCartOpen={() => setIsCartOpen(true)} />}>
                <Route index element={<HomePage onAddToCart={onAddToCart} />} />
                <Route path="menu" element={<MenuPage onAddToCart={onAddToCart} />} />
                <Route path="reservation" element={<Reservation />} />
                <Route path="reservation-payment" element={<Navigate to="/reservation" replace />} />
                <Route path="order-online" element={<Navigate to="/reservation" replace />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="profile" element={<UserProfile />}>
                  <Route index element={<ProfileInfo />} />
                  <Route path="reservations" element={<ReservationHistory />} />
                  <Route path="addresses" element={<AddressBook />} />
                  <Route path="change-password" element={<ChangePassword />} />
                </Route>
              </Route>

              {/* Admin & Internal Staff Routes - Được bảo vệ bởi AdminRoute */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<DashboardLayout roleConfig={adminConfig} />}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="create-account" element={<CreateAccount />} />
                  <Route path="employees" element={<EmployeeList />} />
                  <Route path="customers" element={<CustomerManagement />} />
                  <Route path="customer-history/:id" element={<CustomerHistory />} />
                  <Route path="permissions" element={<RolePermissions />} />
                  <Route path="shifts" element={<ShiftManagement />} /> 
                  <Route path="tables" element={<TableMap />} />
                  <Route path="kitchen-orders" element={<KitchenOrders />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="reports" element={<SalesReport />} />
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="reservations" element={<ReservationManagement />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </AuthRequestInterceptor>
      </Router>
    </AuthProvider>

  );
}

export default App;

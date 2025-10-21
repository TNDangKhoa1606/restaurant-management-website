
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import ComboBanner from './components/ComboBanner';
import IntroductionSection from './components/IntroductionSection';
import MenuHighlightSection from './components/MenuHighlightSection';
import RestaurantInfoSection from './components/RestaurantInfoSection';
import PageBanner from './components/PageBanner';
import MenuDisplay from './components/MenuDisplay';
import Footer from './components/Footer';
import Cart from './components/Cart';
import MenuPage from './pages/MenuPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/ServicesPage'; 
import blogBannerImage from './assets/images/banner-.jpg'; 
import contactBannerImage from './assets/images/banner-02.jpg'; 
import BackToTop from './components/BackToTop';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Checkout from './pages/Checkout';
import Reservation from './pages/Reservation';
import UserProfile from './pages/profile/UserProfile';
import OrderHistory from './pages/profile/OrderHistory';
import ProfileInfo from './pages/profile/ProfileInfo';
import AddressBook from './pages/profile/AddressBook'; // Import component mới
import OrderDetail from './pages/profile/OrderDetail'; // Import component mới
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
import MenuManagement from './pages/admin/MenuManagement';
import TableManagement from './pages/admin/TableManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import SalesReport from './pages/admin/SalesReport';

// Component Layout chính cho các trang của khách hàng
const MainLayout = ({ cartItems, onCartOpen }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Xác định chi tiết (tiêu đề, ảnh) cho banner dựa trên đường dẫn
  const getBannerDetails = () => {
    switch (location.pathname) {
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
      case '/checkout':
        return { 
          title: 'Thanh Toán', 
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
        <Outlet />
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
    { to: '/admin/dashboard', text: 'Dashboard' },
    { to: '/admin/employees', text: 'Danh sách nhân viên' },
    { to: '/admin/create-account', text: 'Tạo tài khoản' },
    { to: '/admin/permissions', text: 'Phân quyền' },
    { to: '/admin/shifts', text: 'Ca làm việc' },
    { to: '/admin/menu', text: 'Thực đơn' },
    { to: '/admin/tables', text: 'Bàn ăn' },
    { to: '/admin/inventory', text: 'Kho nguyên liệu' },
    { to: '/admin/reports', text: 'Thống kê doanh số' },
  ],
  pageTitles: {
    '/admin': 'Dashboard',
    '/admin/dashboard': 'Dashboard',
    '/admin/employees': 'Danh sách nhân viên',
    '/admin/create-account': 'Tạo tài khoản',
    '/admin/permissions': 'Phân quyền chức năng',
    '/admin/shifts': 'Quản lý ca làm việc',
    '/admin/menu': 'Quản lý thực đơn',
    '/admin/tables': 'Quản lý bàn ăn',
    '/admin/inventory': 'Quản lý kho nguyên liệu',
    '/admin/reports': 'Thống kê doanh số',
  }
};

const receptionistConfig = {
  roleName: 'Lễ tân',
  avatarBgColor: '3498db',
  navLinks: [
    { to: '/receptionist/reservations', text: 'Quản lý Đặt bàn' }
  ],
  pageTitles: {
    '/receptionist': 'Quản lý Đặt bàn',
    '/receptionist/reservations': 'Quản lý Đặt bàn',
  }
};

const kitchenConfig = {
  roleName: 'Bếp',
  avatarBgColor: '2ecc71',
  navLinks: [
    { to: '/kitchen/orders', text: 'Món cần chế biến' }
  ],
  pageTitles: {
    '/kitchen': 'Danh sách món cần chế biến',
    '/kitchen/orders': 'Danh sách món cần chế biến',
  }
};

const waiterConfig = {
  roleName: 'Phục vụ',
  avatarBgColor: 'f39c12',
  navLinks: [
    { to: '/waiter/tables', text: 'Sơ đồ bàn' }
  ],
  pageTitles: {
    '/waiter': 'Sơ đồ bàn',
    '/waiter/tables': 'Sơ đồ bàn',
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

  // Lưu giỏ hàng vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    console.log('Cart updated:', cartItems);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
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
    <Router>
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/table/:tableId" element={<TableMenu />} />

          {/* Các trang sử dụng Layout chính (có Header/Footer) */}
          <Route path="/" element={<MainLayout cartItems={cartItems} onCartOpen={() => setIsCartOpen(true)} />}>
            <Route index element={<HomePage onAddToCart={onAddToCart} />} />
            <Route path="menu" element={<MenuPage onAddToCart={onAddToCart} />} />
            <Route path="reservation" element={<Reservation />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="profile" element={<UserProfile />}>
              <Route index element={<ProfileInfo />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="orders/:orderId" element={<OrderDetail />} />
              <Route path="addresses" element={<AddressBook />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout roleConfig={adminConfig} />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Route for the Create Account page */}
            <Route path="create-account" element={<CreateAccount />} />

            {/* Route for the Employee List page */}
            <Route path="employees" element={<EmployeeList />} />

            {/* Route for the Role Permissions page */}
            <Route path="permissions" element={<RolePermissions />} />

            {/* Route for the Shift Management page */}
            <Route path="shifts" element={<ShiftManagement />} />

            {/* Route for the Menu Management page */}
            <Route path="menu" element={<MenuManagement />} />

            {/* Route for the Table Management page */}
            <Route path="tables" element={<TableManagement />} />

            {/* Route for the Inventory Management page */}
            <Route path="inventory" element={<InventoryManagement />} />

            {/* Route for the Sales Report page */}
            <Route path="reports" element={<SalesReport />} />
          </Route>

          {/* Receptionist Routes */}
          <Route path="/receptionist" element={<DashboardLayout roleConfig={receptionistConfig} />}>
            <Route index element={<ReservationManagement />} />
            <Route path="reservations" element={<ReservationManagement />} />
          </Route>

          {/* Kitchen Routes */}
          <Route path="/kitchen" element={<DashboardLayout roleConfig={kitchenConfig} />}>
            <Route index element={<KitchenOrders />} />
            <Route path="orders" element={<KitchenOrders />} />
          </Route>

          {/* Waiter Routes */}
          <Route path="/waiter" element={<DashboardLayout roleConfig={waiterConfig} />}>
            <Route index element={<TableMap />} />
            <Route path="tables" element={<TableMap />} />
          </Route>
        </Routes>
      </div>
    </Router>

  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';

// Import các components chính
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPopup from './components/LoginPopup';

// Import các pages
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import EditMovie from './pages/EditMovie';
import Movies from './pages/Movies';
import VideoPlayer from './pages/VideoPlayer';
import MyUploads from './pages/MyUploads';
import AdminDashboard from './pages/AdminDashboard';

/**
 * Component chính của ứng dụng
 * Quản lý routing và layout tổng thể
 */
function App() {
  return (
    <Router>
      {/* AuthProvider: Cung cấp context authentication cho toàn bộ app */}
      <AuthProvider>
        {/* Layout chính: flexbox column với min-height 100vh */}
        <div className="d-flex flex-column min-vh-100">
          {/* Header: Navigation bar cố định */}
          <Header />
          
          {/* Main content: Chiếm phần còn lại của viewport */}
          <main className="flex-grow-1">
            <Routes>
              {/* Route mặc định: Trang Movies */}
              <Route path="/" element={<Movies />} />
              
              {/* Routes xác thực */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Routes quản lý phim (cần đăng nhập) */}
              <Route path="/upload" element={<Upload />} />
              <Route path="/edit/:id" element={<EditMovie />} />
              <Route path="/my-uploads" element={<MyUploads />} />
              
              {/* Routes xem phim */}
              <Route path="/movies" element={<Movies />} />
              <Route path="/video/:id" element={<VideoPlayer />} />
              <Route path="/v/:slug" element={<VideoPlayer />} />
              
              {/* Route admin */}
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          
          {/* Footer: Thông tin cuối trang */}
          <Footer />
          
          {/* LoginPopup: Popup thông báo đăng nhập */}
          <LoginPopup />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

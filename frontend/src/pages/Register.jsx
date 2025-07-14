import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu mạnh
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{6,}$/;
    
    if (!passwordRegex.test(formData.password)) {
      setError('Mật khẩu phải có ít nhất 6 ký tự, bao gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // Đăng ký thành công
      setIsSuccess(true);
      // Tự động chuyển sang trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-person-plus text-primary" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Tạo tài khoản mới</h2>
                  <p className="text-muted">Tham gia cộng đồng MovieTube ngay hôm nay</p>
                </div>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                {isSuccess && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.
                    <div className="mt-2">
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        Tự động chuyển sang trang đăng nhập sau 2 giây...
                      </small>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className={isSuccess ? 'opacity-50' : ''}>
                  <div className="mb-4">
                    <label htmlFor="username" className="form-label fw-semibold text-dark">
                      <i className="bi bi-person me-2 text-primary"></i>
                      Tên người dùng
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-0 bg-light"
                      id="username"
                      name="username"
                      placeholder="Nhập tên người dùng"
                      value={formData.username}
                      onChange={handleChange}
                      style={{ borderRadius: '12px' }}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold text-dark">
                      <i className="bi bi-envelope me-2 text-primary"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg border-0 bg-light"
                      id="email"
                      name="email"
                      placeholder="Nhập email của bạn"
                      value={formData.email}
                      onChange={handleChange}
                      style={{ borderRadius: '12px' }}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">
                      <i className="bi bi-lock me-2 text-primary"></i>
                      Mật khẩu
                    </label>
                    <div className="input-group input-group-lg">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border-0 bg-light"
                        id="password"
                        name="password"
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                        style={{ borderRadius: '12px 0 0 12px' }}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary border-0 bg-light"
                        type="button"
                        onClick={togglePasswordVisibility}
                        style={{ borderRadius: '0 12px 12px 0' }}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
                      </button>
                    </div>
                    <div className="form-text text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Mật khẩu phải có ít nhất 6 ký tự, bao gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold text-dark">
                      <i className="bi bi-shield-check me-2 text-primary"></i>
                      Xác nhận mật khẩu
                    </label>
                    <div className="input-group input-group-lg">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control border-0 bg-light"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        style={{ borderRadius: '12px 0 0 12px' }}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary border-0 bg-light"
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        style={{ borderRadius: '0 12px 12px 0' }}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 form-check">
                    <input type="checkbox" className="form-check-input" id="agreeTerms" required />
                    <label className="form-check-label text-muted" htmlFor="agreeTerms">
                      Tôi đồng ý với{' '}
                      <a href="#" className="text-decoration-none text-primary">Điều khoản sử dụng</a>
                      {' '}và{' '}
                      <a href="#" className="text-decoration-none text-primary">Chính sách bảo mật</a>
                    </label>
                  </div>

                  <div className="d-grid mb-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg fw-semibold"
                      disabled={isLoading || isSuccess}
                      style={{ 
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Đang đăng ký...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Đăng ký
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center">
                  <p className="mb-0">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: '#667eea' }}>
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 
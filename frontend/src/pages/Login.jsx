import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login({
        email: formData.email,
        password: formData.password
      });

      // Đăng nhập thành công - tự động chuyển trang
      navigate('/movies'); // Chuyển về trang phim
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi đăng nhập');
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
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-film text-primary" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Chào mừng trở lại!</h2>
                  <p className="text-muted">Đăng nhập vào tài khoản của bạn</p>
                </div>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
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
                  </div>

                  <div className="mb-4 form-check">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                    <label className="form-check-label text-muted" htmlFor="rememberMe">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>

                  <div className="d-grid mb-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg fw-semibold"
                      disabled={isLoading}
                      style={{ 
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Đang đăng nhập...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Đăng nhập
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center">
                  <p className="mb-0">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-decoration-none fw-semibold" style={{ color: '#667eea' }}>
                      Đăng ký ngay
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

export default Login; 
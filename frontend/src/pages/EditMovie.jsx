import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMovieById, updateMovie } from '../services/movieService';

const EditMovie = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
    tags: '',
    year: '',
    director: '',
    cast: ''
  });

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        const response = await getMovieById(id);
        const movieData = response.data;
        
        setMovie(movieData);
        setFormData({
          title: movieData.title || '',
          slug: movieData.slug || '',
          description: movieData.description || '',
          category: movieData.category || '',
          tags: movieData.tags ? movieData.tags.join(', ') : '',
          year: movieData.year || '',
          director: movieData.director || '',
          cast: movieData.cast ? movieData.cast.join(', ') : ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading movie:', error);
        alert('Không thể tải thông tin phim');
        navigate('/movies');
      }
    };

    loadMovie();
  }, [id, navigate]);

  // Redirect nếu chưa đăng nhập
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Kiểm tra quyền edit - admin và moderator
  const canEdit = user?.role === 'admin' || user?.role === 'moderator';

  // Redirect nếu không có quyền
  if (!canEdit) {
    alert('Bạn không có quyền chỉnh sửa phim. Chỉ admin và moderator mới được phép.');
    navigate('/');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề phim');
      return;
    }

    if (!formData.description.trim()) {
      alert('Vui lòng nhập mô tả phim');
      return;
    }

    if (!formData.category) {
      alert('Vui lòng chọn thể loại');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        cast: formData.cast ? formData.cast.split(',').map(actor => actor.trim()) : [],
        year: formData.year ? parseInt(formData.year) : undefined
      };

      console.log('Updating movie with data:', updateData);
      const response = await updateMovie(id, updateData);
      console.log('Movie updated:', response);
      console.log('Response data:', response.data);
      console.log('Updated movie slug:', response.data?.slug);
      
      setSaving(false);
      alert('Cập nhật phim thành công!');
      
      // Redirect về slug mới từ response, không thì về ID
      const updatedMovie = response.data;
      if (updatedMovie && updatedMovie.slug) {
        console.log('Redirecting to slug:', `/v/${updatedMovie.slug}`);
        navigate(`/v/${updatedMovie.slug}`);
      } else {
        console.log('Redirecting to ID:', `/video/${id}`);
        navigate(`/video/${id}`);
      }

    } catch (error) {
      console.error('Update error:', error);
      alert('Có lỗi xảy ra khi cập nhật phim. Vui lòng thử lại.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
          <h5>Không tìm thấy phim</h5>
          <p className="text-muted">Phim có thể đã bị xóa hoặc không tồn tại.</p>
          <button onClick={() => navigate('/movies')} className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại danh sách phim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="h2 mb-3">
              <i className="bi bi-pencil-square text-primary me-2"></i>
              Chỉnh sửa Phim
            </h1>
            <p className="text-muted">
              Cập nhật thông tin phim: <strong>{movie.title}</strong>
            </p>
          </div>

          {/* Edit Form */}
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-film me-2"></i>
                    Tiêu đề phim *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Nhập tiêu đề phim"
                    required
                  />
                </div>

                {/* Slug */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-link-45deg me-2"></i>
                    Slug (URL thân thiện)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="ten-phim-2024"
                  />
                  <small className="text-muted">Để trống để tự động tạo slug</small>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-text-paragraph me-2"></i>
                    Mô tả phim *
                  </label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Mô tả chi tiết về phim..."
                    required
                  ></textarea>
                </div>

                {/* Category */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-tags me-2"></i>
                    Thể loại *
                  </label>
                  <select
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn thể loại</option>
                    <option value="Action">Action</option>
                    <option value="Romance">Romance</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Horror">Horror</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Animation">Animation</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Tags */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-hash me-2"></i>
                    Tags
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="tag1, tag2, tag3"
                  />
                  <small className="text-muted">Phân cách bằng dấu phẩy</small>
                </div>

                {/* Year */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-calendar me-2"></i>
                    Năm phát hành
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                {/* Director */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-person me-2"></i>
                    Đạo diễn
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="director"
                    value={formData.director}
                    onChange={handleInputChange}
                    placeholder="Tên đạo diễn"
                  />
                </div>

                {/* Cast */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-people me-2"></i>
                    Diễn viên
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="cast"
                    value={formData.cast}
                    onChange={handleInputChange}
                    placeholder="Diễn viên 1, Diễn viên 2, Diễn viên 3"
                  />
                  <small className="text-muted">Phân cách bằng dấu phẩy</small>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary flex-fill"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Cập nhật phim
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      if (movie && movie.slug) {
                        navigate(`/v/${movie.slug}`);
                      } else {
                        navigate(`/video/${id}`);
                      }
                    }}
                    disabled={saving}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMovie; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMovieById, updateMovie } from '../services/movieService';
import { categoryList } from '../utils/categoryMapping';

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
    cast: '',
    youtubeUrl: '',
    useYoutubeThumbnail: true
  });
  
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

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
          cast: movieData.cast ? movieData.cast.join(', ') : '',
          youtubeUrl: movieData.youtubeUrl || '',
          useYoutubeThumbnail: !movieData.thumbnail || movieData.thumbnail.includes('youtube.com')
        });
        
        // Set thumbnail preview
        if (movieData.thumbnail) {
          setThumbnailPreview(movieData.thumbnail);
        }
        
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleThumbnailChange = (e) => {
    const selectedThumbnail = e.target.files[0];
    if (selectedThumbnail) {
      // Kiểm tra loại file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(selectedThumbnail.type)) {
        alert('Chỉ chấp nhận file ảnh (JPG, PNG, GIF)');
        return;
      }
      
      setThumbnail(selectedThumbnail);
      
      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(selectedThumbnail);
    }
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
        year: formData.year ? parseInt(formData.year) : undefined,
        status: 'pending' // Sau khi chỉnh sửa, status = pending để admin duyệt lại
      };

      // Nếu có thumbnail mới, thêm vào FormData
      let response;
      if (thumbnail) {
        const formDataToSend = new FormData();
        Object.keys(updateData).forEach(key => {
          formDataToSend.append(key, updateData[key]);
        });
        formDataToSend.append('thumbnail', thumbnail);
        
        console.log('Updating movie with FormData including thumbnail');
        response = await updateMovie(id, formDataToSend);
      } else {
        console.log('Updating movie with data:', updateData);
        response = await updateMovie(id, updateData);
      }
      console.log('Movie updated:', response);
      console.log('Response data:', response.data);
      console.log('Updated movie slug:', response.data?.slug);
      
      setSaving(false);
      alert('Cập nhật phim thành công! Clip đã được chuyển về trạng thái "Chờ duyệt" để admin xem xét.');
      
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
                    {categoryList.map(category => (
                      <option key={category.name} value={category.name}>
                        {category.label}
                      </option>
                    ))}
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
                <div className="mb-3">
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

                {/* YouTube URL */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-youtube me-2"></i>
                    Link YouTube *
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  <small className="text-muted">Link YouTube video</small>
                </div>

                {/* Thumbnail Options */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-image me-2"></i>
                    Thumbnail
                  </label>
                  
                  {/* Use YouTube Thumbnail Option */}
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="useYoutubeThumbnail"
                      checked={formData.useYoutubeThumbnail}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">
                      Sử dụng thumbnail từ YouTube
                    </label>
                  </div>

                  {/* Upload Custom Thumbnail */}
                  {!formData.useYoutubeThumbnail && (
                    <div className="mb-2">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                      <small className="text-muted">Chọn ảnh thumbnail tùy chỉnh (JPG, PNG, GIF)</small>
                    </div>
                  )}

                  {/* Thumbnail Preview */}
                  {thumbnailPreview && (
                    <div className="mt-2">
                      <img 
                        src={thumbnailPreview} 
                        alt="Thumbnail preview" 
                        className="img-thumbnail"
                        style={{ maxWidth: '200px', maxHeight: '150px' }}
                      />
                    </div>
                  )}
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
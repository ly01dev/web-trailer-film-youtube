import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createMovie } from '../services/movieService';

const Upload = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
    tags: '',
    visibility: 'public',
    youtubeUrl: ''
  });
  
  const [thumbnail, setThumbnail] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);

  // Redirect nếu chưa đăng nhập
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Kiểm tra quyền upload - dựa vào role từ user object
  // Admin và moderator đều được upload
  const canUpload = user?.role === 'admin' || user?.role === 'moderator';

  // Redirect nếu không có quyền upload
  if (!canUpload) {
    alert('Bạn không có quyền truy cập trang này. Chỉ admin và moderator mới được đăng tải video.');
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
    }
  };

  // Hàm extract YouTube video ID từ URL
  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Kiểm tra và lấy thông tin video từ YouTube
  const handleCheckVideo = async () => {
    if (!formData.youtubeUrl.trim()) {
      alert('Vui lòng nhập link YouTube');
      return;
    }

    const videoId = extractYouTubeId(formData.youtubeUrl);
    if (!videoId) {
      alert('Link YouTube không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Gọi API backend để lấy thông tin video từ YouTube
      console.log('Checking YouTube video:', videoId);
      
      // Simulate API call
      setTimeout(() => {
        setVideoInfo({
          id: videoId,
          title: 'Video Title from YouTube',
          description: 'Video description from YouTube...',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          duration: '10:30',
          channel: 'YouTube Channel',
          publishedAt: '2024-01-15'
        });
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      console.error('Error checking video:', error);
      alert('Không thể lấy thông tin video. Vui lòng thử lại.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.youtubeUrl.trim()) {
      alert('Vui lòng nhập link YouTube');
      return;
    }

    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề video');
      return;
    }

    const videoId = extractYouTubeId(formData.youtubeUrl);
    if (!videoId) {
      alert('Link YouTube không hợp lệ');
      return;
    }

    setIsProcessing(true);

    try {
      const movieData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        youtubeUrl: formData.youtubeUrl,
        category: formData.category,
        tags: formData.tags,
        duration: videoInfo?.duration || '0:00',
        year: new Date().getFullYear(),
        director: 'Unknown',
        cast: []
      };

      console.log('Sending movie data:', movieData);
      const response = await createMovie(movieData);
      console.log('Movie created:', response);
      
      setIsProcessing(false);
      
      // Hiển thị thông báo phù hợp với role
      if (user?.role === 'admin') {
        alert('Đăng tải thành công! Clip đã được xuất bản.');
        navigate('/movies');
      } else if (user?.role === 'moderator') {
        alert('Đăng tải thành công! Clip đã được gửi để xét duyệt. Admin sẽ kiểm tra và phê duyệt trong thời gian sớm nhất.');
        navigate('/my-uploads');
      } else {
        alert('Đăng tải thành công!');
        navigate('/movies');
      }

    } catch (error) {
      console.error('Save error:', error);
      alert('Có lỗi xảy ra khi đăng tải. Vui lòng thử lại.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="h2 mb-3">
              <i className="bi bi-youtube text-danger me-2"></i>
              Đăng Tải Phim Mới
            </h1>
            <p className="text-muted">
              Chia sẻ phim hay từ YouTube với cộng đồng Film8X
            </p>
          </div>

          {/* Upload Form */}
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* YouTube URL Section */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-link-45deg me-2"></i>
                    Link YouTube *
                  </label>
                  
                  <div className="input-group">
                    <input
                      type="url"
                      className="form-control form-control-lg"
                      name="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={handleInputChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleCheckVideo}
                      disabled={isProcessing || !formData.youtubeUrl.trim()}
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Đang kiểm tra...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search me-2"></i>
                          Kiểm tra
                        </>
                      )}
                    </button>
                  </div>
                  <div className="form-text">
                    Nhập link video YouTube hợp lệ
                  </div>
                </div>

                {/* Video Preview */}
                {videoInfo && (
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <i className="bi bi-play-circle me-2"></i>
                      Thông tin Video
                    </label>
                    
                    <div className="card border-success">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4">
                            <img 
                              src={videoInfo.thumbnail} 
                              alt="Video thumbnail" 
                              className="img-fluid rounded"
                            />
                          </div>
                          <div className="col-md-8">
                            <h6 className="card-title">{videoInfo.title}</h6>
                            <p className="card-text text-muted small">
                              {videoInfo.description.substring(0, 100)}...
                            </p>
                            <div className="d-flex justify-content-between text-muted small">
                              <span>
                                <i className="bi bi-clock me-1"></i>
                                {videoInfo.duration}
                              </span>
                              <span>
                                <i className="bi bi-person me-1"></i>
                                {videoInfo.channel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Details */}
                <div className="row">
                  <div className="col-md-8">
                    {/* Title */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="bi bi-type me-2"></i>
                        Tiêu đề *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Nhập tiêu đề video..."
                        maxLength={100}
                        required
                      />
                      <div className="form-text">
                        {formData.title.length}/100 ký tự
                      </div>
                    </div>

                    {/* Slug */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="bi bi-link me-2"></i>
                        URL tùy chỉnh
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="ten-phim-khong-dau"
                        maxLength={100}
                      />
                      <div className="form-text">
                        Tạo URL tùy chỉnh cho video (không dấu, dùng dấu gạch ngang). Ví dụ: avengers-endgame
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="bi bi-text-paragraph me-2"></i>
                        Mô tả
                      </label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Mô tả video của bạn..."
                        rows="4"
                        maxLength={500}
                      ></textarea>
                      <div className="form-text">
                        {formData.description.length}/500 ký tự
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="bi bi-tags me-2"></i>
                        Tags
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="Nhập tags, phân cách bằng dấu phẩy..."
                      />
                      <div className="form-text">
                        Ví dụ: phim hành động, viễn tưởng, hài hước
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    {/* Custom Thumbnail */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="bi bi-image me-2"></i>
                        Thumbnail tùy chỉnh
                      </label>
                      <div className="border rounded p-3 text-center">
                        {thumbnail ? (
                          <div>
                            <img 
                              src={URL.createObjectURL(thumbnail)} 
                              alt="Custom thumbnail" 
                              className="img-fluid rounded mb-2"
                              style={{ maxHeight: '120px' }}
                            />
                            <button 
                              type="button" 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => setThumbnail(null)}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Xóa
                            </button>
                          </div>
                        ) : (
                          <div>
                            <i className="bi bi-image text-muted fs-1 mb-2"></i>
                            <p className="text-muted small mb-2">Sử dụng thumbnail YouTube</p>
                            <button 
                              type="button" 
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => document.getElementById('thumbnailFile').click()}
                            >
                              <i className="bi bi-plus me-1"></i>
                              Tùy chỉnh
                            </button>
                          </div>
                        )}
                        <input
                          id="thumbnailFile"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="d-none"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="bi bi-collection me-2"></i>
                        Thể loại *
                      </label>
                      <select
                        className="form-select"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Chọn thể loại...</option>
                        <option value="Action">Hành động</option>
                        <option value="Romance">Tình cảm</option>
                        <option value="Comedy">Hài hước</option>
                        <option value="Horror">Kinh dị</option>
                        <option value="Sci-Fi">Viễn tưởng</option>
                        <option value="Animation">Hoạt hình</option>
                        <option value="Documentary">Tài liệu</option>
                        <option value="Other">Khác</option>
                      </select>
                    </div>

                    {/* Visibility */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="bi bi-eye me-2"></i>
                        Quyền riêng tư
                      </label>
                      <select
                        className="form-select"
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleInputChange}
                      >
                        <option value="public">Công khai</option>
                        <option value="unlisted">Không công khai</option>
                        <option value="private">Riêng tư</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="d-flex justify-content-between pt-3 border-top">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/')}
                    disabled={isProcessing}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Hủy
                  </button>
                  
                  <button 
                    type="submit" 
                    className="btn btn-success btn-lg"
                    disabled={isProcessing || !formData.youtubeUrl.trim() || !formData.title.trim()}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang đăng tải...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-youtube me-2"></i>
                        Đăng tải Video
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Upload Tips */}
          <div className="card mt-4 bg-light border-0">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-lightbulb text-warning me-2"></i>
                Mẹo đăng tải
              </h6>
              <ul className="card-text small mb-0">
                <li>Chỉ sử dụng link YouTube hợp lệ</li>
                <li>Đảm bảo video không vi phạm bản quyền</li>
                <li>Thêm mô tả chi tiết và tags phù hợp</li>
                <li>Chọn thể loại chính xác để dễ tìm kiếm</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload; 
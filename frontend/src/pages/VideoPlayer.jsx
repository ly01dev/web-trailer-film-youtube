import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMovieById, getMovieBySlug, getRelatedMovies, likeMovie, dislikeMovie } from '../services/movieService';

const VideoPlayer = () => {
  const { id, slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [relatedVideos, setRelatedVideos] = useState([]);

  // Load video data
  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);
        let response;
        if (slug) {
          response = await getMovieBySlug(slug);
        } else {
          response = await getMovieById(id);
        }
        setVideo(response.data);
        
        // TODO: Load comments and related videos from API
        // For now, using mock data
        setComments([
          {
            id: 1,
            text: 'Phim hay quá! Cảm ơn bạn đã chia sẻ.',
            user: { username: 'user1' },
            createdAt: '2024-01-15',
            likes: 5
          },
          {
            id: 2,
            text: 'Thật sự là một khoảnh khắc đáng nhớ trong MCU.',
            user: { username: 'user2' },
            createdAt: '2024-01-14',
            likes: 3
          }
        ]);
        
        // Load related videos from API
        if (response.data.category) {
          try {
            const relatedResponse = await getRelatedMovies(
              response.data.category, 
              response.data._id, 
              8
            );
            setRelatedVideos(relatedResponse.data);
          } catch (error) {
            console.error('Error loading related videos:', error);
            setRelatedVideos([]);
          }
        } else {
          setRelatedVideos([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading video:', error);
        setLoading(false);
      }
    };

    loadVideo();
  }, [id, slug]);

  const handleLike = async () => {
    if (!video || !video._id) return;
    try {
      const response = await likeMovie(video._id);
      if (response && response.likes !== undefined) {
        setVideo(prev => ({
          ...prev,
          likes: response.likes
        }));
      }
    } catch {
      alert('Có lỗi xảy ra khi like video');
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để không thích video');
      return;
    }
    
    if (!video || !video._id) {
      console.error('Video data is missing');
      return;
    }
    
    try {
      const response = await dislikeMovie(video._id);
      console.log('Dislike response:', response);
      
      // Only update state if response is valid
      if (response && response.likes !== undefined) {
        setVideo(prev => ({
          ...prev,
          likes: response.likes,
          dislikes: response.dislikes,
          hasLiked: response.hasLiked,
          hasDisliked: response.hasDisliked
        }));
      }
    } catch (error) {
      console.error('Dislike error:', error);
      alert('Có lỗi xảy ra khi không thích video');
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để bình luận');
      return;
    }
    if (!newComment.trim()) {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }
    
    // TODO: Implement comment functionality
    const comment = {
      id: Date.now(),
      text: newComment,
      user: { username: user?.username },
      createdAt: new Date().toISOString(),
      likes: 0
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Đang tải video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
          <h5>Không tìm thấy video</h5>
          <p className="text-muted">Video có thể đã bị xóa hoặc không tồn tại.</p>
          <Link to="/movies" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại danh sách phim
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        {/* Main Video Section */}
        <div className="col-lg-8">
          {/* Video Player */}
          <div className="mb-4">
            <div className="ratio ratio-16x9">
              <iframe
                src={`https://www.youtube.com/embed/${video?.youtubeId || ''}?autoplay=0&rel=0`}
                title={video?.title || 'Video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded"
              ></iframe>
            </div>
          </div>

          {/* Video Info */}
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="card-title mb-3">{video?.title || 'Loading...'}</h4>
              
              {/* Stats Row */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <span className="text-muted me-3">
                    <i className="bi bi-eye me-1"></i>
                    {formatViews(video?.views || 0)} lượt xem
                  </span>
                  <span className="text-muted me-3">
                    <i className="bi bi-calendar me-1"></i>
                    {formatDate(video?.createdAt || new Date())}
                  </span>
                </div>
                
                <div className="d-flex align-items-center">
                  {/* Edit Button - Only for admin/moderator */}
                  {(user?.role === 'admin' || user?.role === 'moderator') && (
                    <Link 
                      to={`/edit/${video._id}`}
                      className="btn btn-outline-warning btn-sm me-2"
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                      Chỉnh sửa
                    </Link>
                  )}
                  
                  <button 
                    className="btn btn-sm btn-primary me-2"
                    onClick={handleLike}
                  >
                    <i className="bi bi-hand-thumbs-up-fill me-1"></i>
                    {video?.likes || 0}
                  </button>
                  <button 
                    className={`btn btn-sm me-2 ${video?.hasDisliked ? 'btn-secondary' : 'btn-outline-secondary'}`}
                    onClick={handleDislike}
                  >
                    <i className={`bi ${video?.hasDisliked ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down'} me-1`}></i>
                    {video?.dislikes || 0}
                  </button>
                  <button 
                    className="btn btn-outline-success btn-sm"
                    onClick={() => {
                      const url = `${window.location.origin}/v/${video?.slug || ''}`;
                      navigator.clipboard.writeText(url).then(() => {
                        alert('Đã copy link vào clipboard!');
                      }).catch(() => {
                        // Fallback cho trình duyệt cũ
                        const textArea = document.createElement('textarea');
                        textArea.value = url;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        alert('Đã copy link vào clipboard!');
                      });
                    }}
                  >
                    <i className="bi bi-share me-1"></i>
                    Chia sẻ
                  </button>
                </div>
              </div>

              {/* User Info */}
              <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                <i className="bi bi-person-circle fs-4 me-3"></i>
                <div>
                  <h6 className="mb-0">{video.uploadedBy?.username || 'Admin'}</h6>
                  <small className="text-muted">Người đăng tải</small>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <h6>Mô tả</h6>
                <p className="text-muted">{video.description}</p>
              </div>

              {/* Tags */}
              <div>
                <h6>Tags</h6>
                <div className="d-flex flex-wrap gap-2">
                  {video.tags.map(tag => (
                    <span key={tag} className="badge bg-primary">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-chat-dots me-2"></i>
                Bình luận ({comments.length})
              </h5>

              {/* Add Comment */}
              {isAuthenticated ? (
                <div className="mb-4">
                  <form onSubmit={handleComment}>
                    <div className="d-flex">
                      <div className="flex-grow-1 me-3">
                        <textarea
                          className="form-control"
                          placeholder="Viết bình luận..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows="2"
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-send me-1"></i>
                        Gửi
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-light rounded text-center">
                  <i className="bi bi-chat-dots text-muted fs-4 mb-2"></i>
                  <p className="text-muted mb-2">Bạn cần đăng nhập để bình luận</p>
                  <Link to="/login" className="btn btn-primary btn-sm">
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Đăng nhập
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="d-flex mb-3">
                    <i className="bi bi-person-circle fs-4 me-3 text-muted"></i>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <h6 className="mb-0 me-2">{comment.user.username}</h6>
                        <small className="text-muted">{formatDate(comment.createdAt)}</small>
                      </div>
                      <p className="mb-1">{comment.text}</p>
                      <div className="d-flex align-items-center">
                        <button className="btn btn-sm btn-outline-secondary me-2">
                          <i className="bi bi-hand-thumbs-up me-1"></i>
                          {comment.likes}
                        </button>
                        <button className="btn btn-sm btn-outline-secondary">
                          <i className="bi bi-reply me-1"></i>
                          Trả lời
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Related Videos */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-collection-play me-2"></i>
                Video liên quan
              </h6>
            </div>
            <div className="card-body p-0">
              {relatedVideos.length > 0 ? (
                relatedVideos.map(video => (
                <Link 
                  key={video._id} 
                  to={`/v/${video.slug}`}
                  className="d-flex p-3 border-bottom text-decoration-none text-dark hover-bg-light"
                  style={{
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <img
                    src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                    alt={video.title}
                    className="rounded me-3"
                    style={{ width: '120px', height: '68px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                    }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '0.9rem'
                    }}>
                      {video.title}
                    </h6>
                    <small className="text-muted d-block">
                      {video.uploadedBy?.username || 'Admin'}
                    </small>
                    <small className="text-muted">
                      {formatViews(video.views)} lượt xem
                    </small>
                  </div>
                </Link>
              ))
              ) : (
                <div className="p-3 text-center text-muted">
                  <i className="bi bi-collection-play fs-4 mb-2"></i>
                  <p className="mb-0">Không có video liên quan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 
/**
 * Mapping từ category tiếng Anh sang tiếng Việt
 * Giữ nguyên giá trị backend, chỉ thay đổi hiển thị frontend
 */
export const categoryMapping = {
  'action': 'Hành động',
  'comedy': 'Hài hước',
  'drama': 'Tâm lý',
  'horror': 'Kinh dị',
  'romance': 'Tình cảm',
  'sci-fi': 'Khoa học viễn tưởng',
  'thriller': 'Giật gân',
  'documentary': 'Tài liệu',
  'animation': 'Hoạt hình',
  'other': 'Khác'
};

/**
 * Chuyển đổi category từ tiếng Anh sang tiếng Việt
 * @param {string} category - Category tiếng Anh
 * @returns {string} Category tiếng Việt
 */
export const getCategoryLabel = (category) => {
  if (!category) return 'Khác';
  return categoryMapping[category.toLowerCase()] || category;
};

/**
 * Danh sách categories với label tiếng Việt
 */
export const categoryList = [
  { name: 'action', label: 'Hành động', icon: 'bi-lightning', color: '#dc3545' },
  { name: 'comedy', label: 'Hài hước', icon: 'bi-emoji-laughing', color: '#ffc107' },
  { name: 'drama', label: 'Tâm lý', icon: 'bi-theater-masks', color: '#6f42c1' },
  { name: 'horror', label: 'Kinh dị', icon: 'bi-ghost', color: '#212529' },
  { name: 'romance', label: 'Tình cảm', icon: 'bi-heart', color: '#e83e8c' },
  { name: 'sci-fi', label: 'Khoa học viễn tưởng', icon: 'bi-rocket', color: '#17a2b8' },
  { name: 'thriller', label: 'Giật gân', icon: 'bi-exclamation-triangle', color: '#fd7e14' },
  { name: 'documentary', label: 'Tài liệu', icon: 'bi-camera-video', color: '#28a745' },
  { name: 'animation', label: 'Hoạt hình', icon: 'bi-palette', color: '#6f42c1' },
  { name: 'other', label: 'Khác', icon: 'bi-three-dots', color: '#6c757d' }
];

/**
 * Lấy category object từ name
 * @param {string} name - Category name
 * @returns {object} Category object
 */
export const getCategoryByName = (name) => {
  return categoryList.find(cat => cat.name === name) || categoryList[categoryList.length - 1];
}; 
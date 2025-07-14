import React from 'react';

/**
 * Component Footer - Footer của ứng dụng
 * Hiển thị copyright và thông tin cơ bản
 * Sử dụng mt-auto để đẩy xuống cuối trang
 */
function Footer() {
  return (
    <footer className="bg-light text-center py-4 mt-auto border-top">
      <div className="container">
        <span className="text-muted">
          &copy; {new Date().getFullYear()} MovieTube. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer; 
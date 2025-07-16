import React, { useEffect } from 'react';

/**
 * Component SEOHead - Quản lý meta tags và SEO
 * Cập nhật title, description, Open Graph tags động
 */
const SEOHead = ({ 
  title = "Film8X - Kho Phim Hay Nhất 2025",
  description = "Khám phá kho phim khổng lồ với hàng nghìn bộ phim chất lượng cao. Xem phim online HD miễn phí, không quảng cáo.",
  image = "https://film8x.xyz/og-image.jpg",
  url = "https://film8x.xyz",
  type = "website"
}) => {
  useEffect(() => {
    // Cập nhật title
    document.title = title;
    
    // Cập nhật meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
    
    // Cập nhật Open Graph tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'og:url': url,
      'og:type': type
    };
    
    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
    
    // Cập nhật Twitter tags
    const twitterTags = {
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:url': url
    };
    
    Object.entries(twitterTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
    
    // Cập nhật canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
    
  }, [title, description, image, url, type]);

  return null; // Component này không render gì
};

export default SEOHead; 
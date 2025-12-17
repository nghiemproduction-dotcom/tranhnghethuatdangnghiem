'use client';

import React, { useState, useEffect } from 'react';

// Link ảnh từ Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

export default function KhungUngDungMobile({ children }: { children: React.ReactNode }) {
  const [bgImage, setBgImage] = useState('');
  
  // 🟢 ĐÃ XÓA: const [isMobile, setIsMobile] = useState(false); (Vì không dùng)

  useEffect(() => {
    // Hàm này chạy ngay khi web vừa load để quyết định ảnh nền
    const chonAnhNen = () => {
        const width = window.innerWidth;
        const timeStamp = new Date().getTime(); // Chống cache tuyệt đối
        
        if (width < 768) {
            // MOBILE
            // setIsMobile(true); -> Đã xóa
            setBgImage(`${BASE_IMG_URL}/login-mobile.jpg?v=${timeStamp}`);
        } else if (width < 1024) {
            // TABLET
            // setIsMobile(false); -> Đã xóa
            setBgImage(`${BASE_IMG_URL}/login-tablet.jpg?v=${timeStamp}`);
        } else {
            // DESKTOP
            // setIsMobile(false); -> Đã xóa
            setBgImage(`${BASE_IMG_URL}/login-desktop.jpg?v=${timeStamp}`);
        }
    };

    chonAnhNen(); // Chạy ngay lập tức
    window.addEventListener('resize', chonAnhNen); // Chạy lại nếu xoay màn hình
    return () => window.removeEventListener('resize', chonAnhNen);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black text-white">
        
        {/* 1. LAYER NỀN (Được JS ép buộc load đúng link) */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500"
            style={{ 
                backgroundImage: bgImage ? `url('${bgImage}')` : 'none',
                backgroundColor: '#050505' // Màu chờ khi ảnh chưa tải xong
            }}
        />

        {/* Lớp phủ tối để chữ dễ đọc */}
        <div className="absolute inset-0 z-0 bg-black/40" />

        {/* 2. LAYER NỘI DUNG (Nổi lên trên) */}
        <div className="relative z-10 w-full h-full flex flex-col">
            {children}
        </div>

    </div>
  );
}
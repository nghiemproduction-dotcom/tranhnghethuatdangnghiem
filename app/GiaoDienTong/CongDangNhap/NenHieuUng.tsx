'use client';
import React from 'react';

// Lấy URL gốc của Supabase từ biến môi trường
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Đường dẫn đến kho ảnh (Lưu ý: Bucket tên là 'hinh-nen')
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

interface Props {
  isModalMode: boolean;
}

export default function NenHieuUng({ isModalMode }: Props) {
  
  // Link 3 tấm ảnh
  const bgMobile = `${BASE_IMG_URL}/login-mobile.jpg`;
  const bgTablet = `${BASE_IMG_URL}/login-tablet.jpg`;
  const bgDesktop = `${BASE_IMG_URL}/login-desktop.jpg`;

  return (
    <div className={`absolute inset-0 bg-[#050505] overflow-hidden ${isModalMode ? 'rounded-2xl' : ''}`}>
       
       {/* 1. LAYER ẢNH NỀN (RESPONSIVE) */}
       {/* Mobile: Chỉ hiện ảnh dọc */}
       <div 
         className="absolute inset-0 bg-cover bg-center md:hidden transition-opacity duration-700"
         style={{ backgroundImage: `url('${bgMobile}')` }}
       />
       
       {/* Tablet: Chỉ hiện ảnh vừa (Từ 768px trở lên) */}
       <div 
         className="absolute inset-0 bg-cover bg-center hidden md:block lg:hidden transition-opacity duration-700"
         style={{ backgroundImage: `url('${bgTablet}')` }}
       />

       {/* Desktop: Chỉ hiện ảnh ngang to (Từ 1024px trở lên) */}
       <div 
         className="absolute inset-0 bg-cover bg-center hidden lg:block transition-opacity duration-700"
         style={{ backgroundImage: `url('${bgDesktop}')` }}
       />

       {/* 2. LAYER PHỦ TỐI (Overlay) */}
       {/* Giúp chữ nổi bật hơn trên nền ảnh */}
       <div className={`absolute inset-0 bg-black/60 ${isModalMode ? 'bg-black/70' : ''}`} />

       {/* 3. HIỆU ỨNG ĐỐM SÁNG (Giữ lại chút nghệ thuật) */}
       <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[100px] mix-blend-overlay" />
    </div>
  );
}
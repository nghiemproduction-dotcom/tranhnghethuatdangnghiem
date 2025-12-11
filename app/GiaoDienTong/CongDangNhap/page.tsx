'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// Import Component CongDangNhap cùng thư mục
import CongDangNhap from './CongDangNhap'; 

export default function TrangCongDangNhap() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden">
      
      {/* 1. TÁI SỬ DỤNG BACKGROUND CỦA TRANG CHỦ 
          (Để khi popup hiện lên trên nền mờ, phía sau vẫn là không gian nghệ thuật) 
      */}
      <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Trang trí thêm chữ mờ phía sau để không quá trống trải */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
         <h1 className="text-[12vw] font-bold text-white/5 tracking-widest select-none whitespace-nowrap">
            LOGIN SPACE
         </h1>
      </div>

      {/* 2. GỌI MODAL ĐĂNG NHẬP
          - isOpen={true}: Luôn mở vì đây là trang đăng nhập chuyên biệt.
          - onClose: Quay về trang chủ nếu người dùng bấm đóng hoặc bấm ra ngoài.
      */}
      <CongDangNhap 
        isOpen={true} 
        onClose={() => router.push('/')} 
      />

    </div>
  );
}
'use client';
import React from 'react';

// Trang này chỉ hiển thị thông báo đơn giản để tránh lỗi Build
export default function PhongQuanLyPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1a120f] text-[#C69C6D] p-4">
      <div className="max-w-md text-center space-y-4 border border-[#8B5E3C]/30 p-8 rounded-2xl bg-black/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[#F5E6D3]">
          Phòng Quản Lý
        </h1>
        <div className="h-px w-20 bg-[#8B5E3C] mx-auto opacity-50"></div>
        <p className="opacity-80 font-light">
          Khu vực dành riêng cho cấp quản lý.
          <br />
          Vui lòng chọn chức năng từ menu chính.
        </p>
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Image as ImageIcon, LogIn } from 'lucide-react';

const danhSachTacPham = [
  { id: 1, ten: 'Ánh Sáng Vô Tận', tacGia: 'Nguyễn Văn A', loai: 'Digital Art', mau: 'from-blue-500 to-purple-600' },
  { id: 2, ten: 'Không Gian Ảo', tacGia: 'Trần Thị B', loai: '3D Model', mau: 'from-green-400 to-cyan-500' },
  { id: 3, ten: 'Cấu Trúc Tương Lai', tacGia: 'Lê C', loai: 'Concept Art', mau: 'from-orange-400 to-red-500' },
  { id: 4, ten: 'Tĩnh Lặng', tacGia: 'Phạm D', loai: 'Photography', mau: 'from-gray-700 to-gray-900' },
  { id: 5, ten: 'Sóng Âm', tacGia: 'Hoàng E', loai: 'Abstract', mau: 'from-pink-500 to-rose-500' },
  { id: 6, ten: 'Cyberpunk 2077', tacGia: 'Vũ F', loai: 'Game Art', mau: 'from-yellow-400 to-orange-500' },
];

export default function PhongTrungBayPage() {
  return (
    <div className="min-h-screen bg-[#131314] text-[#E3E3E3] selection:bg-blue-500/30">
      
      <header className="fixed top-0 w-full z-50 bg-[#131314]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-lg">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Art Space <span className="text-xs font-normal text-gray-400 ml-1">| Gallery</span></span>
          </div>

          <div className="flex items-center gap-4">
            {/* 🟢 SỬA ĐƯỜNG DẪN: Trỏ về đúng folder CongDangNhap trong GiaoDienTong */}
            <Link 
              href="/GiaoDienTong/CongDangNhap" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <LogIn size={18} />
              <span>Đăng nhập nội bộ</span>
            </Link>
            <button className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors">
              Liên hệ
            </button>
          </div>
        </div>
      </header>

      {/* --- CÁC PHẦN DƯỚI GIỮ NGUYÊN --- */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-medium mb-6">
            Triển lãm Nghệ thuật Số 2024
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Khám phá Không gian <br /> Sáng tạo Đa chiều
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Nơi hội tụ những tác phẩm độc đáo nhất từ cộng đồng nghệ sĩ Art Space. 
            Trải nghiệm thị giác đỉnh cao và cảm hứng bất tận.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all flex items-center gap-2 group">
              Xem tất cả tác phẩm
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="text-blue-500" />
            Tác phẩm nổi bật
          </h2>
          <div className="flex gap-2">
            {['Tất cả', 'Digital', '3D', 'Photography'].map((tab) => (
              <button 
                key={tab}
                className="px-4 py-1.5 rounded-full text-xs font-medium border border-white/10 hover:bg-white/10 transition-colors"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {danhSachTacPham.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-[#1A1A1C] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${item.mau} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <button className="bg-white text-black py-2 px-4 rounded-lg font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    Xem chi tiết
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {item.ten}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-gray-400">
                    {item.loai}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  bởi <span className="text-gray-300">{item.tacGia}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 bg-[#0E0E0F]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 Art Space Gallery. Được xây dựng trên nền tảng quản lý Art Space.
          </p>
        </div>
      </footer>
    </div>
  );
}
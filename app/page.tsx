'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, ArrowRight } from 'lucide-react'; 
import CongDangNhap from '@/app/GiaoDienTong/CongDangNhap/CongDangNhap';
import GoogleDich from '@/app/ThuVien/GoogleDich'; 

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

export default function TrangChaoMung() {
  const [hienPopupLogin, setHienPopupLogin] = useState(false);

  const baseUrl = SUPABASE_URL ? BASE_IMG_URL : '';
  const bgMobile = `${baseUrl}/login-mobile.jpg`;
  const bgTablet = `${baseUrl}/login-tablet.jpg`;
  const bgDesktop = `${baseUrl}/login-desktop.jpg`;

  return (
    <div className="relative h-screen w-full bg-[#050505] text-[#F5F5F5] overflow-hidden font-sans flex flex-col">
      
      {/* 1. LAYER NỀN */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          {SUPABASE_URL && (
            <>
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden transition-opacity duration-1000" style={{ backgroundImage: `url('${bgMobile}')` }} />
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block lg:hidden transition-opacity duration-1000" style={{ backgroundImage: `url('${bgTablet}')` }} />
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden lg:block transition-opacity duration-1000" style={{ backgroundImage: `url('${bgDesktop}')` }} />
            </>
          )}
          
          {/* Vẫn giữ lớp phủ 70% đen */}
          <div className="absolute inset-0 bg-black/70" />
          
          {/* Gradient đáy giữ nguyên */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-gray-900/90 via-transparent to-white/10" />
      </div>

      <GoogleDich />

      {/* 2. CỤM CHỮ (ĐƯỢC TĂNG CƯỜNG ĐỔ BÓNG) */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center space-y-6 px-4 animate-fade-in-up">
            
            <div className="space-y-4">
                {/* Địa điểm: Thêm bóng nét đậm */}
                <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.3em] text-white uppercase mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
                    <MapPin size={12} className="text-yellow-500" />
                    <span>CẦN THƠ / VIỆT NAM</span>
                </div>

                <div className="relative">
                    {/* TIÊU ĐỀ CHÍNH: Sử dụng class CSS tùy chỉnh 'super-text-shadow' để nổi bật tối đa */}
                    <h1 className="text-5xl md:text-8xl font-thin tracking-widest leading-none text-white super-text-shadow">
                        ĐĂNG NGHIÊM
                    </h1>
                    {/* Subtitle: Thêm bóng nét đậm */}
                    <p className="text-xl md:text-3xl font-serif italic text-yellow-500 mt-2 tracking-wide font-medium drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)]">
                        Art Gallery
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2 mt-2">
                    {/* Thông tin chủ trì: Tăng độ đậm của bóng và đổi màu chữ sang trắng tinh */}
                    <p className="text-sm text-white font-light tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                        Chủ trì bởi Nghệ nhân <strong className="text-white border-b border-yellow-500/50 pb-0.5">Trần Đăng Nghiêm</strong>
                    </p>
                    {/* Huy hiệu: Đã có nền tối nên rất rõ rồi */}
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-yellow-400 font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/10">
                        <Star size={10} fill="currentColor" />
                        <span>Kỷ lục Tranh gạo ST25 lớn nhất Việt Nam</span>
                    </div>
                </div>
            </div>
      </div>

      {/* 3. CỤM NÚT BẤM (SÁT ĐÁY) - Giữ nguyên vì đã rõ */}
      <div className="relative z-10 flex-none w-full pb-8 md:pb-12">
            <div className="flex flex-row items-center justify-center gap-8 md:gap-16 w-full px-4">
                
                {/* Nút KHÁCH */}
                <Link href="/phongtrungbay" className="group flex flex-col items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-white/5 text-white group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500 ease-out shadow-lg border border-white/20 hover:border-yellow-400">
                        <ArrowRight size={24} className="group-hover:-rotate-45 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-sm md:text-base font-bold tracking-[0.2em] text-white group-hover:text-yellow-400 transition-colors drop-shadow-lg">THAM QUAN</span>
                        <span className="hidden sm:block text-[10px] text-gray-400 font-light mt-1 drop-shadow-md">Khách & Đối tác</span>
                    </div>
                </Link>

                {/* Gạch dọc */}
                <div className="w-[1px] h-12 bg-white/20" />

                {/* Nút NỘI BỘ */}
                <button onClick={() => setHienPopupLogin(true)} className="group flex flex-col items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-transparent text-gray-400 group-hover:bg-white group-hover:text-black transition-all duration-500 ease-out shadow-lg border border-white/20 hover:border-white">
                        <ArrowRight size={24} className="group-hover:-rotate-45 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-sm md:text-base font-bold tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors drop-shadow-lg">NỘI BỘ</span>
                        <span className="hidden sm:block text-[10px] text-gray-500 font-light mt-1 drop-shadow-md">Nhân sự & Quản lý</span>
                    </div>
                </button>
            </div>
            
            <div className="text-center mt-4 opacity-50">
                 <p className="text-[8px] tracking-[0.2em] uppercase font-bold text-gray-400 drop-shadow-md">
                    © {new Date().getFullYear()} DANG NGHIEM ART
                 </p>
            </div>
      </div>

      <CongDangNhap isOpen={hienPopupLogin} onClose={() => setHienPopupLogin(false)} />
      
      <style jsx global>{`
        @keyframes fade-in-up { 
            0% { opacity: 0; transform: translateY(20px); } 
            100% { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }

        /* 🟢 CSS TÙY CHỈNH: Tạo bóng đen cực mạnh cho tiêu đề chính */
        .super-text-shadow {
            text-shadow: 
                0 2px 4px rgba(0,0,0,0.9),    /* Bóng gần sắc nét */
                0 8px 16px rgba(0,0,0,0.8),   /* Bóng xa mờ */
                0 0 20px rgba(0,0,0,0.5);     /* Hào quang nhẹ xung quanh */
        }
      `}</style>
    </div>
  );
}
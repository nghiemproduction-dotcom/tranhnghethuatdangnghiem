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
    <div className="relative h-[100dvh] w-full bg-[#050505] text-[#F5F5F5] overflow-hidden font-sans">
      
      {/* 1. LAYER NỀN */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          {SUPABASE_URL && (
            <>
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden transition-opacity duration-1000" style={{ backgroundImage: `url('${bgMobile}')` }} />
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block lg:hidden transition-opacity duration-1000" style={{ backgroundImage: `url('${bgTablet}')` }} />
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden lg:block transition-opacity duration-1000" style={{ backgroundImage: `url('${bgDesktop}')` }} />
            </>
          )}
          
          {/* 🟢 SỬA: GRADIENT LAN TỎA (DƯỚI ĐẬM - TRÊN NHẠT) */}
          {/* from-black (100% đen ở đáy) -> via-black/60 (60% đen ở giữa) -> to-transparent (trong suốt ở đỉnh) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      <GoogleDich />

      {/* 2. CONTAINER NỘI DUNG (CHIẾM ĐÚNG 50% CHIỀU CAO DƯỚI) */}
      <div className="absolute bottom-0 left-0 w-full h-[55%] flex flex-col justify-end items-center pb-6 md:pb-10 px-4 z-10 animate-fade-in-up">
            
            {/* CỤM CHỮ (Dồn xuống sát nút bấm) */}
            <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
                <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.3em] text-white uppercase mb-1 drop-shadow-md">
                    <MapPin size={12} className="text-yellow-500" />
                    <span>CẦN THƠ / VIỆT NAM</span>
                </div>

                <div className="relative">
                    <h1 className="text-4xl md:text-7xl font-thin tracking-widest leading-none text-white super-text-shadow">
                        ĐĂNG NGHIÊM
                    </h1>
                    <p className="text-lg md:text-2xl font-serif italic text-yellow-500 mt-1 tracking-wide font-medium drop-shadow-md">
                        Art Gallery
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2 mt-1">
                    <p className="text-xs md:text-sm text-white/90 font-light tracking-wider drop-shadow-sm">
                        Chủ trì bởi Nghệ nhân <strong className="text-white border-b border-yellow-500/50 pb-0.5">Trần Đăng Nghiêm</strong>
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] md:text-xs text-yellow-400 font-bold bg-white/10 px-3 py-1 rounded-full backdrop-blur-md shadow-lg border border-white/10">
                        <Star size={10} fill="currentColor" />
                        <span>Kỷ lục Tranh gạo ST25 lớn nhất Việt Nam</span>
                    </div>
                </div>
            </div>

            {/* CỤM NÚT BẤM (Nằm sát đáy container) */}
            <div className="flex flex-row items-center justify-center gap-4 md:gap-16 w-full mb-2">
                
                {/* Nút KHÁCH */}
                <Link href="/phongtrungbay" className="group flex flex-col items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-white/5 text-white group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500 ease-out shadow-lg border border-white/20 hover:border-yellow-400">
                        <ArrowRight size={20} className="group-hover:-rotate-45 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-white group-hover:text-yellow-400 transition-colors drop-shadow-lg">THAM QUAN</span>
                        <span className="hidden sm:block text-[9px] text-gray-400 font-light mt-0.5 drop-shadow-md">Khách & Đối tác</span>
                    </div>
                </Link>

                {/* Gạch dọc */}
                <div className="w-[1px] h-8 md:h-10 bg-white/20" />

                {/* Nút NỘI BỘ */}
                <button onClick={() => setHienPopupLogin(true)} className="group flex flex-col items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-transparent text-gray-400 group-hover:bg-white group-hover:text-black transition-all duration-500 ease-out shadow-lg border border-white/20 hover:border-white">
                        <ArrowRight size={20} className="group-hover:-rotate-45 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors drop-shadow-lg">NỘI BỘ</span>
                        <span className="hidden sm:block text-[9px] text-gray-500 font-light mt-0.5 drop-shadow-md">Nhân sự & Quản lý</span>
                    </div>
                </button>
            </div>
            
            <div className="text-center mt-2 opacity-40">
                 <p className="text-[8px] tracking-[0.2em] uppercase font-bold text-gray-500 drop-shadow-sm">
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

        .super-text-shadow {
            text-shadow: 
                0 2px 4px rgba(0,0,0,0.9),    
                0 8px 16px rgba(0,0,0,0.8),   
                0 0 20px rgba(0,0,0,0.5);     
        }
      `}</style>
    </div>
  );
}
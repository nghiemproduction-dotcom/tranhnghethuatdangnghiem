'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, ArrowRight } from 'lucide-react'; 
import CongDangNhap from '@/app/CongDangNhap/CongDangNhap';
import GoogleDich from '@/app/ThuVien/GoogleDich'; 
// Import cái bọc mới
import KhungUngDungMobile from '@/app/components/KhungUngDungMobile';

export default function TrangChaoMung() {
  const [hienPopupLogin, setHienPopupLogin] = useState(false);

  return (
    // 🟢 DÙNG CÁI BỌC NÀY ĐỂ KHỐNG CHẾ GIAO DIỆN
    <KhungUngDungMobile>
      
      <GoogleDich />

      {/* PHẦN NỘI DUNG CHỮ & NÚT */}
      <div className="flex-1 flex flex-col justify-end items-center pb-10 px-4 animate-fade-in-up">
            
            <div className="text-center space-y-3 mb-8">
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase mb-1 drop-shadow-md text-gray-300">
                    <MapPin size={12} className="text-yellow-500" />
                    <span>CẦN THƠ / VIỆT NAM</span>
                </div>

                <div>
                    <h1 className="text-5xl md:text-7xl font-thin tracking-widest leading-none text-white super-text-shadow">
                        ĐĂNG NGHIÊM
                    </h1>
                    <p className="text-xl md:text-2xl font-serif italic text-yellow-500 mt-2 tracking-wide font-medium drop-shadow-md">
                        Art Gallery
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2 mt-2">
                    <p className="text-xs text-white/80 font-light tracking-wider">
                        Chủ trì bởi Nghệ nhân <strong className="text-white border-b border-yellow-500/50 pb-0.5">Trần Đăng Nghiêm</strong>
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] text-yellow-400 font-bold bg-white/10 px-3 py-1 rounded-full backdrop-blur-md shadow-lg border border-white/10">
                        <Star size={10} fill="currentColor" />
                        <span>Kỷ lục Tranh gạo ST25 lớn nhất Việt Nam</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-row items-center justify-center gap-10 w-full mb-4">
                <Link href="/phongtrungbay" className="group flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 text-white border border-white/30 backdrop-blur-sm shadow-xl">
                        <ArrowRight size={22} />
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em]">THAM QUAN</span>
                </Link>

                <div className="w-[1px] h-10 bg-white/20" />

                <button onClick={() => setHienPopupLogin(true)} className="group flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white text-black shadow-xl">
                        <ArrowRight size={22} />
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] text-white">NỘI BỘ</span>
                </button>
            </div>
            
            <div className="text-center mt-4 opacity-40">
                 <p className="text-[8px] tracking-[0.2em] uppercase font-bold text-gray-500">
                    © {new Date().getFullYear()} DANG NGHIEM ART
                 </p>
            </div>
      </div>

      <CongDangNhap isOpen={hienPopupLogin} onClose={() => setHienPopupLogin(false)} />
      
      <style jsx global>{`
        .super-text-shadow { text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
        .animate-fade-in-up { animation: fade-in 1s ease-out; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

    </KhungUngDungMobile>
  );
}
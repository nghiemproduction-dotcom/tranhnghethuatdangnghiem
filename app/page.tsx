'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, Globe, ArrowRight } from 'lucide-react'; // Đổi icon cho tinh tế hơn
import CongDangNhap from '@/app/GiaoDienTong/CongDangNhap/CongDangNhap';
import { useNgonNgu } from '@/app/context/NgonNguContext'; 

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

export default function TrangChaoMung() {
  const [hienPopupLogin, setHienPopupLogin] = useState(false);
  const { t, ngonNgu, setNgonNgu } = useNgonNgu();

  const baseUrl = SUPABASE_URL ? BASE_IMG_URL : '';
  const bgMobile = `${baseUrl}/login-mobile.jpg`;
  const bgTablet = `${baseUrl}/login-tablet.jpg`;
  const bgDesktop = `${baseUrl}/login-desktop.jpg`;

  const languages = [
    { code: 'vi', label: 'VN' },
    { code: 'en', label: 'EN' },
    { code: 'zh', label: 'CN' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
    { code: 'ja', label: 'JP' },
  ];

  return (
    // LAYOUT: flex-col, justify-end (dồn xuống đáy), pb-24 (cách đáy một đoạn vừa đẹp)
    <div className="relative min-h-screen w-full bg-[#050505] text-[#F5F5F5] flex flex-col items-center justify-end pb-12 md:pb-24 overflow-hidden font-sans">
      
      {/* 1. LAYER NỀN + GRADIENT ĐIỆN ẢNH */}
      <div className="absolute inset-0 w-full h-full z-0">
          {SUPABASE_URL && (
            <>
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden transition-opacity duration-1000" style={{ backgroundImage: `url('${bgMobile}')` }} />
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block lg:hidden transition-opacity duration-1000" style={{ backgroundImage: `url('${bgTablet}')` }} />
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden lg:block transition-opacity duration-1000" style={{ backgroundImage: `url('${bgDesktop}')` }} />
            </>
          )}
          
          {/* Lớp phủ tối dần từ dưới lên (Cinematic Gradient) */}
          {/* Giúp chữ nổi bật hoàn hảo mà không cần che hết hình */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          
          {/* Hiệu ứng hạt noise nhẹ cho nghệ thuật */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* 2. THANH NGÔN NGỮ (Tối giản, nằm góc trên phải) */}
      <div className="absolute top-8 right-8 z-20 flex gap-4">
          {languages.map((lang) => (
             <button
               key={lang.code}
               onClick={() => setNgonNgu(lang.code as any)}
               className={`
                 text-[10px] font-bold tracking-widest transition-all duration-300 relative group
                 ${ngonNgu === lang.code ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
               `}
             >
               {lang.label}
               {/* Gạch chân phát sáng khi active */}
               <span className={`absolute -bottom-1 left-0 w-full h-[1px] bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)] transition-transform duration-300 ${ngonNgu === lang.code ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`} />
             </button>
          ))}
      </div>

      {/* 3. NỘI DUNG CHÍNH (Cân giữa, Lệch dưới) */}
      <div className="relative z-10 w-full max-w-screen-lg mx-auto flex flex-col items-center text-center space-y-12 animate-fade-in-up">
        
        {/* CỤM TIÊU ĐỀ */}
        <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 text-[10px] md:text-xs font-medium tracking-[0.4em] text-gray-400 uppercase">
                <MapPin size={12} className="text-yellow-600" />
                <span>{t('canTho')}</span>
                <span className="text-yellow-600">/</span>
                <span>{t('vn')}</span>
            </div>

            <div className="relative">
                <h1 className="text-5xl md:text-8xl font-thin tracking-widest leading-none text-white drop-shadow-2xl mix-blend-overlay opacity-90">
                    {t('tieuDe')}
                </h1>
                <p className="text-xl md:text-3xl font-serif italic text-yellow-500/90 mt-2 tracking-wide drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                    {t('phuDe')}
                </p>
            </div>

            <div className="flex flex-col items-center gap-2">
                <p className="text-xs md:text-sm text-gray-300 font-light tracking-wider">
                    {t('chuTri')} <span className="text-white font-medium border-b border-yellow-600/30 pb-0.5">{t('tenNgheNhan')}</span>
                </p>
                {/* Huy hiệu nhỏ gọn, không chiếm chỗ */}
                <div className="flex items-center gap-1.5 text-[9px] text-yellow-400/80 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Star size={8} fill="currentColor" />
                    <span>{t('kyLuc')}</span>
                </div>
            </div>
        </div>

        {/* CỤM NÚT BẤM (Trong suốt - Không viền - Phát sáng) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16 w-full pt-4">
            
            {/* Nút KHÁCH */}
            <Link 
                href="/phongtrungbay" 
                className="group relative flex flex-col items-center justify-center gap-2 p-4 transition-all duration-500"
            >
                {/* Icon mũi tên bay lên khi hover */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-gray-300 group-hover:bg-yellow-500 group-hover:text-black group-hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] transition-all duration-500 ease-out">
                    <ArrowRight size={20} className="group-hover:-rotate-45 transition-transform duration-500" />
                </div>
                
                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold tracking-[0.2em] text-white group-hover:text-yellow-400 group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] transition-all duration-300">
                        {t('nutKhach')}
                    </span>
                    <span className="text-[9px] text-gray-500 font-light tracking-wide group-hover:text-gray-300 transition-colors">
                        {t('moTaKhach')}
                    </span>
                </div>
            </Link>

            {/* Thanh gạch dọc ngăn cách (chỉ hiện trên desktop) */}
            <div className="hidden sm:block w-[1px] h-12 bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

            {/* Nút NỘI BỘ */}
            <button 
                onClick={() => setHienPopupLogin(true)}
                className="group relative flex flex-col items-center justify-center gap-2 p-4 transition-all duration-500 cursor-pointer"
            >
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-transparent border border-white/10 text-gray-400 group-hover:border-white/50 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-500 ease-out">
                    <ArrowRight size={20} className="group-hover:-rotate-45 transition-transform duration-500" />
                </div>

                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold tracking-[0.2em] text-gray-400 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300">
                        {t('nutNoiBo')}
                    </span>
                    <span className="text-[9px] text-gray-600 font-light tracking-wide group-hover:text-gray-400 transition-colors">
                        {t('moTaNoiBo')}
                    </span>
                </div>
            </button>
        </div>

      </div>

      {/* FOOTER (Ẩn dưới đáy) */}
      <div className="absolute bottom-4 left-0 w-full text-center opacity-30 pointer-events-none">
             <p className="text-[9px] tracking-[0.3em] uppercase font-light">
                {t('banQuyen')}
             </p>
      </div>

      <CongDangNhap isOpen={hienPopupLogin} onClose={() => setHienPopupLogin(false)} />

      <style jsx global>{`
        @keyframes fade-in-up { 
            0% { opacity: 0; transform: translateY(40px); } 
            100% { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in-up { animation: fade-in-up 1.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
      `}</style>
    </div>
  );
}
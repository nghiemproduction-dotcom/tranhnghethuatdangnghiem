'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, MapPin, ArrowRight } from 'lucide-react'; 
import CongDangNhap from '@/app/CongDangNhap/CongDangNhap';
import GoogleDich from '@/app/ThuVien/GoogleDich'; 
import NhacNen from '@/app/Music/NhacNen';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

export default function TrangChaoMung() {
  const router = useRouter(); 
  const [hienPopupLogin, setHienPopupLogin] = useState(false);

  // URL hình nền
  // Thêm fallback để tránh lỗi nếu biến môi trường chưa load kịp
  const baseUrl = SUPABASE_URL ? BASE_IMG_URL : '';
  const bgMobile = `${baseUrl}/login-mobile.jpg?v=1`;
  const bgDesktop = `${baseUrl}/login-desktop.jpg?v=1`;

  // 1. Kiểm tra lúc mới vào trang (F5)
  useEffect(() => {
    kiemTraVaChuyenHuong();
  }, [router]);

  // Hàm kiểm tra logic đăng nhập
  const kiemTraVaChuyenHuong = () => {
    // Kiểm tra window để đảm bảo code chạy ở client
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('USER_INFO');
        if (storedUser) {
            router.push('/trangchu');
        }
    }
  };

  // 2. 🟢 QUAN TRỌNG: Hàm xử lý khi đóng popup đăng nhập
  const handleClosePopup = () => {
      setHienPopupLogin(false);
      // Kiểm tra lại ngay lập tức sau khi đóng popup
      // Nếu đăng nhập thành công, localStorage đã có dữ liệu -> Chuyển hướng luôn
      kiemTraVaChuyenHuong();
  };

  return (
    <div className="relative h-[100dvh] w-full bg-[#050505] text-[#F5F5F5] overflow-hidden font-sans flex flex-col">
      
      <NhacNen />

      {/* HÌNH NỀN: Đã tối ưu Responsive */}
      {/* Logic cũ bị thiếu src ở thẻ img giữa (Tablet). 
          Đã sửa: Mobile dùng bgMobile, từ Tablet trở lên (md:block) dùng bgDesktop */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none">
          {SUPABASE_URL && (
            <>
              {/* Mobile View (< 768px) */}
              <img 
                src={bgMobile} 
                alt="Background Mobile" 
                className="absolute inset-0 w-full h-full object-cover md:hidden" 
                loading="eager" 
              />
              
              {/* Desktop/Tablet View (>= 768px) */}
              <img 
                src={bgDesktop} 
                alt="Background Desktop" 
                className="absolute inset-0 w-full h-full object-cover hidden md:block" 
                loading="eager" 
              />
            </>
          )}
          {/* Lớp phủ gradient để làm nổi bật chữ */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      <GoogleDich />

      {/* NỘI DUNG CHỮ & NÚT */}
      {/* Sử dụng flex-col và justify-end để nội dung luôn nằm dưới đáy hợp lý trên mọi màn hình */}
      <div className="absolute bottom-0 left-0 w-full h-full max-h-[100dvh] flex flex-col justify-end items-center pb-16 md:pb-24 lg:pb-32 px-4 z-10 animate-fade-in-up pointer-events-none">
            
            {/* Wrapper nội dung chính - pointer-events-auto để click được */}
            <div className="pointer-events-auto w-full max-w-4xl mx-auto flex flex-col items-center">
                
                {/* HEADLINE SECTION */}
                <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12">
                    <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.3em] text-white uppercase mb-2 drop-shadow-md">
                        <MapPin size={12} className="text-yellow-500" />
                        <span>CẦN THƠ / VIỆT NAM</span>
                    </div>
                    <div className="relative">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-thin tracking-widest leading-none text-white super-text-shadow">
                            ĐĂNG NGHIÊM
                        </h1>
                        <p className="text-lg sm:text-xl md:text-3xl font-serif italic text-yellow-500 mt-2 tracking-wide font-medium drop-shadow-md">
                            Art Gallery
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3 mt-4">
                        <p className="text-xs sm:text-sm md:text-base text-white/90 font-light tracking-wider drop-shadow-sm px-4">
                            Chủ trì bởi Nghệ nhân <strong className="text-white border-b border-yellow-500/50 pb-0.5 whitespace-nowrap">Trần Đăng Nghiêm</strong>
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] md:text-xs text-yellow-400 font-bold bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/10 mx-2 text-center">
                            <Star size={10} fill="currentColor" className="shrink-0" />
                            <span className="truncate max-w-[280px] sm:max-w-none">Kỷ lục Tranh gạo ST25 lớn nhất Việt Nam</span>
                        </div>
                    </div>
                </div>

                {/* BUTTONS SECTION */}
                <div className="flex flex-row items-center justify-center gap-6 sm:gap-10 md:gap-16 w-full mb-6">
                    {/* Nút Tham Quan */}
                    <Link href="/phongtrungbay" className="group flex flex-col items-center gap-3 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-white/5 text-white group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500 ease-out shadow-lg border border-white/20 hover:border-yellow-400">
                            <ArrowRight size={20} className="md:w-6 md:h-6 group-hover:-rotate-45 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-white group-hover:text-yellow-400 transition-colors drop-shadow-lg">THAM QUAN</span>
                            <span className="hidden sm:block text-[9px] md:text-[10px] text-gray-400 font-light mt-1 drop-shadow-md">Khách & Đối tác</span>
                        </div>
                    </Link>

                    {/* Divider */}
                    <div className="w-[1px] h-10 md:h-14 bg-white/20" />

                    {/* Nút Nội Bộ */}
                    <button onClick={() => setHienPopupLogin(true)} className="group flex flex-col items-center gap-3 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-transparent text-gray-400 group-hover:bg-white group-hover:text-black transition-all duration-500 ease-out shadow-lg border border-white/20 hover:border-white">
                            <ArrowRight size={20} className="md:w-6 md:h-6 group-hover:-rotate-45 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors drop-shadow-lg">NỘI BỘ</span>
                            <span className="hidden sm:block text-[9px] md:text-[10px] text-gray-500 font-light mt-1 drop-shadow-md">Nhân sự & Quản lý</span>
                        </div>
                    </button>
                </div>
            
                {/* FOOTER COPYRIGHT */}
                <div className="text-center mt-4 opacity-40">
                     <p className="text-[8px] md:text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 drop-shadow-sm">
                        © {new Date().getFullYear()} DANG NGHIEM ART
                     </p>
                </div>
            </div>
      </div>

      {/* 🟢 GỌI HANDLE CLOSE POPUP ĐỂ CHECK LOGIN */}
      <CongDangNhap isOpen={hienPopupLogin} onClose={handleClosePopup} />
      
      <style jsx global>{`
        @keyframes fade-in-up { 
            0% { opacity: 0; transform: translateY(20px); } 
            100% { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in-up { animation: fade-in-up 1.5s ease-out forwards; }
        .super-text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 8px 16px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5); }
      `}</style>
    </div>
  );
}
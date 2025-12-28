'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  targetId: string; // ID của phần nội dung bắt đầu
  forceHide?: boolean; // Ẩn cưỡng bức (khi menu mở)
}

export default function NutXemThem({ targetId, forceHide = false }: Props) {
  const [scrollState, setScrollState] = useState<'top' | 'hidden' | 'bottom'>('top');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // 1. Ở đầu trang (trong khoảng 100px đầu)
      if (scrollY < 100) {
        setScrollState('top');
      } 
      // 2. Ở cuối trang (cách đáy khoảng 100px)
      else if (windowHeight + scrollY >= docHeight - 100) {
        setScrollState('bottom');
      } 
      // 3. Ở giữa (đang cuộn xem nội dung) -> Ẩn
      else {
        setScrollState('hidden');
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Gọi ngay lần đầu để set trạng thái đúng
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (scrollState === 'top') {
      // Đang ở trên -> Cuộn xuống nội dung (targetId)
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (scrollState === 'bottom') {
      // Đang ở dưới -> Cuộn lên đầu trang (Top 0)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Logic ẩn hiện: Ẩn nếu forceHide=true HOẶC đang ở giữa (hidden)
  const isHidden = forceHide || scrollState === 'hidden';

  return (
    <div 
      className={`fixed left-1/2 -translate-x-1/2 z-[95] transition-all duration-700 ease-in-out
        ${isHidden ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}
        ${scrollState === 'top' ? 'bottom-28 md:bottom-12' : 'bottom-24 md:bottom-28'} 
        /* bottom-24 ở chế độ bottom để tránh đè lên footer/menu dưới quá sát */
      `}
    >
      <button 
        onClick={handleClick}
        className="flex flex-col items-center gap-2 group cursor-pointer"
        title={scrollState === 'top' ? "Xem nội dung" : "Lên đầu trang"}
      >
        {/* TEXT: Chỉ hiện khi ở chế độ Top (theo yêu cầu biến mất khi cuộn) */}
        {scrollState === 'top' && (
             <span 
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white animate-fade-in-up drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
            >
                Xem nội dung
            </span>
        )}
        
        {scrollState === 'bottom' && (
             <span 
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#C69C6D] animate-fade-in-up drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
            >
                Lên đầu trang
            </span>
        )}

        {/* ICON BUTTON */}
        <div className={`rounded-full border-2 bg-black/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(198,156,109,0.5)] transition-all duration-500 hover:scale-110 
            ${scrollState === 'bottom' 
                ? 'w-10 h-10 md:w-12 md:h-12 border-[#C69C6D] text-[#C69C6D] hover:bg-[#C69C6D] hover:text-black' // Style nút Lên
                : 'w-12 h-12 md:w-14 md:h-14 border-[#C69C6D] text-[#C69C6D] animate-bounce hover:bg-[#C69C6D] hover:text-black' // Style nút Xuống
            }`}
        >
            {scrollState === 'bottom' ? <ChevronUp size={24} /> : <ChevronDown size={28} />}
        </div>
      </button>
    </div>
  );
}
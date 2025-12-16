'use client';

import React, { useState, useEffect } from 'react';
import { Maximize, Sparkles } from 'lucide-react';

export default function ForceFullScreen() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Kiểm tra PWA (Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
        setIsFullScreen(true);
        return;
    }

    const checkFull = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullScreen(isFull);
    };

    document.addEventListener('fullscreenchange', checkFull);
    return () => document.removeEventListener('fullscreenchange', checkFull);
  }, []);

  const enterFullScreen = () => {
    const elem = document.documentElement as any;
    if (elem.requestFullscreen) {
      elem.requestFullscreen()?.catch((err: any) => console.log(err)); // Bắt lỗi nếu trình duyệt chặn
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  };

  if (!mounted || isFullScreen) return null;

  return (
    // Nền tối mờ sang trọng
    <div className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      
      <div className="flex flex-col items-center max-w-xs">
        {/* Icon nhẹ nhàng */}
        <Sparkles className="text-gray-500 mb-4 opacity-50" size={28} />

        {/* Lời mời ngắn gọn */}
        <h2 className="text-gray-200 text-base font-medium tracking-wide mb-8 leading-relaxed font-light">
          Chạm vào bên dưới để có trải nghiệm ứng dụng tốt nhất
        </h2>

        {/* Nút bấm Dark Mode cao cấp */}
        <button 
            onClick={enterFullScreen}
            className="group relative px-8 py-3.5 bg-[#1A1A1A] hover:bg-[#222] border border-white/10 hover:border-[#0091FF]/40 rounded-full transition-all duration-500 active:scale-95 overflow-hidden shadow-lg"
        >
            {/* Hiệu ứng ánh sáng nền khi hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0091FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full loading-shimmer"></div>
            
            {/* Nội dung nút */}
            <span className="relative z-10 flex items-center justify-center gap-2 text-white font-bold text-sm uppercase tracking-widest">
                <Maximize size={16} className="text-gray-400 group-hover:text-white transition-colors"/> 
                Mở Toàn Màn Hình
            </span>
        </button>

      </div>

      {/* Style cho hiệu ứng shimmer */}
      <style jsx>{`
        .loading-shimmer { animation: shimmer 2s infinite; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
}
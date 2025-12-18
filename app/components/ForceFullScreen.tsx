'use client';

import React, { useState, useEffect } from 'react';
import { Maximize, Ban } from 'lucide-react'; 
import { usePathname } from 'next/navigation';

export default function ForceFullScreen() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // 1. LOGIC FIX LỖI HỞ TRẮNG (APP HEIGHT HACK)
  useEffect(() => {
    const setAppHeight = () => {
        const doc = document.documentElement;
        // Lấy chiều cao thực tế của vùng nhìn thấy
        doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    // Chạy ngay lập tức
    setAppHeight();

    // Chạy lại khi xoay màn hình hoặc resize
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', setAppHeight);

    return () => {
        window.removeEventListener('resize', setAppHeight);
        window.removeEventListener('orientationchange', setAppHeight);
    };
  }, []);

  // 2. LOGIC FULLSCREEN API (F11 MODE)
  const triggerFull = () => {
      const elem = document.documentElement as any;
      if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };

  const disableFullScreenMode = () => {
      if (typeof window !== 'undefined') {
          localStorage.setItem('GLOBAL_FULLSCREEN_PREF', 'false');
          setShowPrompt(false);
      }
  };

  useEffect(() => {
    if (pathname === '/') {
        setShowPrompt(false);
        return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    const savedPref = localStorage.getItem('GLOBAL_FULLSCREEN_PREF');
    const isExplicitlyDisabled = savedPref === 'false';

    if (!isExplicitlyDisabled) {
        const isFullscreen = document.fullscreenElement || (document as any).webkitFullscreenElement;
        if (!isFullscreen && !ios) {
            setShowPrompt(true);
        }
    }

    const handleChange = () => {
        const isFs = document.fullscreenElement || (document as any).webkitFullscreenElement;
        if (isFs) setShowPrompt(false);
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);

    return () => {
        document.removeEventListener('fullscreenchange', handleChange);
        document.removeEventListener('webkitfullscreenchange', handleChange);
    };
  }, [pathname]);

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-[#C69C6D] to-[#5D4037] flex items-center justify-center shadow-[0_0_30px_rgba(198,156,109,0.4)]">
            <Maximize className="text-white w-8 h-8 animate-pulse" />
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold text-[#F5E6D3] mb-2 text-center uppercase tracking-widest">
            Trải nghiệm tốt nhất
        </h2>
        
        <p className="text-gray-400 text-sm md:text-base text-center max-w-md mb-8 leading-relaxed">
            Ứng dụng được thiết kế để chạy ở chế độ toàn màn hình. Vui lòng kích hoạt để ẩn thanh địa chỉ và mở rộng không gian làm việc.
        </p>
        
        {isIOS ? (
             <p className="text-[#A1887F] text-sm mb-8 font-light px-2 relative z-10 text-center border border-[#8B5E3C]/30 p-4 rounded-lg bg-[#1a120f]">
                Trên iPhone/iPad: Nhấn nút <strong>Chia sẻ (Share)</strong> <br/> Chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.
             </p>
        ) : (
            <div className="flex flex-col gap-3 relative z-10 w-full max-w-xs">
                <button 
                    onClick={(e) => { e.stopPropagation(); triggerFull(); }}
                    className="w-full py-3 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold text-xs uppercase tracking-widest rounded-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                    <Maximize size={16} /> Bật toàn màn hình
                </button>

                <button 
                    onClick={(e) => { e.stopPropagation(); disableFullScreenMode(); }}
                    className="w-full py-3 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <Ban size={16} /> Không hiển thị lại
                </button>
            </div>
        )}
    </div>
  );
}
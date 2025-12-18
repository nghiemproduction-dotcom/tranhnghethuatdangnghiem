'use client';

import React, { useState, useEffect } from 'react';
import { Maximize, Ban, AlertCircle } from 'lucide-react'; // Thêm icon Ban cho nút tắt
import { usePathname } from 'next/navigation';

export default function ForceFullScreen() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Hàm kích hoạt Fullscreen
  const triggerFull = () => {
      const elem = document.documentElement as any;
      if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };

  // Hàm TẮT chế độ toàn màn hình vĩnh viễn
  const disableFullScreenMode = () => {
      if (typeof window !== 'undefined') {
          localStorage.setItem('GLOBAL_FULLSCREEN_PREF', 'false');
          setShowPrompt(false);
      }
  };

  useEffect(() => {
    // 1. Nếu là trang chủ -> Luôn cho qua
    if (pathname === '/') {
        setShowPrompt(false);
        return;
    }

    // 2. Kiểm tra thiết bị
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphone = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIphone);

    // 3. Hàm kiểm tra trạng thái
    const checkStatus = () => {
        // 0. LOẠI TRỪ LOCALHOST (Môi trường dev không cần check)
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            setShowPrompt(false);
            return;
        }

        // PWA Mode -> Coi như Full
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) {
            setShowPrompt(false);
            return;
        }

        // Kiểm tra xem user CÓ BẬT chế độ này không? (Master Switch)
        const wantsFull = localStorage.getItem('GLOBAL_FULLSCREEN_PREF') === 'true';
        
        // Nếu user ĐÃ TẮT -> Thì không bao giờ hiện bảng nữa
        if (!wantsFull) {
            setShowPrompt(false);
            return;
        }

        // Nếu user ĐANG BẬT -> Kiểm tra xem trình duyệt có đang full không?
        const doc = document as any;
        const isFull = !!(
            doc.fullscreenElement || 
            doc.webkitFullscreenElement || 
            doc.mozFullScreenElement || 
            doc.msFullscreenElement
        );

        if (isFull) {
            setShowPrompt(false);
        } else {
            // Muốn full nhưng đang bị rớt -> Hiện bảng cảnh báo
            setShowPrompt(true);
        }
    };

    // Đợi 1 chút sau khi chuyển trang mới check (tránh báo ảo khi đang load)
    const timer = setTimeout(() => {
        checkStatus();
    }, 800); 

    // CƠ CHẾ TỰ ĐỘNG KHÔI PHỤC KHI CLICK (Chỉ khi bảng đang hiện)
    const handleGlobalClick = () => {
        if (showPrompt) {
            triggerFull();
        }
    };
    // Lưu ý: Tạm tắt global click tự động để user còn bấm được nút "Tắt chế độ"
    // window.addEventListener('click', handleGlobalClick);

    // Lắng nghe sự kiện
    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange'];
    events.forEach(e => document.addEventListener(e, checkStatus));
    
    const interval = setInterval(checkStatus, 2000);

    return () => {
        clearTimeout(timer);
        // window.removeEventListener('click', handleGlobalClick);
        events.forEach(e => document.removeEventListener(e, checkStatus));
        clearInterval(interval);
    };
  }, [pathname, showPrompt]);

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#110d0c]/95 backdrop-blur-md flex flex-col items-center justify-center text-center animate-in fade-in duration-300 touch-none">
      
      <div className="relative p-8 rounded-2xl bg-[#1a120f] border border-[#8B5E3C] shadow-[0_0_40px_rgba(0,0,0,0.8)] max-w-sm mx-4 overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C69C6D]/10 to-transparent pointer-events-none"></div>

        <AlertCircle className="text-[#C69C6D] mb-4 mx-auto animate-pulse" size={48} strokeWidth={1.5} />

        <h2 className="text-[#F5E6D3] text-lg font-bold uppercase tracking-widest mb-4 relative z-10 leading-snug">
          Bạn đã cho phép bật toàn màn hình, vui lòng xác nhận lại !
        </h2>
        
        {isIOS ? (
             <p className="text-[#A1887F] text-sm mb-8 font-light px-2 relative z-10">
                Trên iPhone/iPad, vui lòng thêm ứng dụng vào màn hình chính (Add to Home Screen) để có trải nghiệm tốt nhất.
             </p>
        ) : (
            <div className="flex flex-col gap-3 relative z-10 w-full">
                {/* NÚT 1: CHO PHÉP (Kích hoạt lại Fullscreen) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); triggerFull(); }}
                    className="w-full py-3 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold text-xs uppercase tracking-widest rounded-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                    <Maximize size={16} /> Cho phép toàn màn hình
                </button>

                {/* NÚT 2: TẮT CHẾ ĐỘ (Tắt Master Switch) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); disableFullScreenMode(); }}
                    className="w-full py-3 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <Ban size={16} /> Tắt chế độ toàn màn hình
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, Smartphone, Monitor, Maximize } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ForceFullScreen() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Biến kiểm tra loại thiết bị
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // 1. LOGIC TÍNH CHIỀU CAO "BẤT TỬ" (Giữ nguyên để fix lỗi hở trắng)
  useEffect(() => {
    const setAppHeight = () => {
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        document.documentElement.style.setProperty('--app-height', `${vh}px`);
    };

    setAppHeight();

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', setAppHeight);
        window.visualViewport.addEventListener('scroll', setAppHeight);
    } else {
        window.addEventListener('resize', setAppHeight);
    }

    return () => {
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', setAppHeight);
            window.visualViewport.removeEventListener('scroll', setAppHeight);
        } else {
            window.removeEventListener('resize', setAppHeight);
        }
    };
  }, []);

  // 2. LOGIC KIỂM TRA & ÉP CÀI ĐẶT
  useEffect(() => {
    // Bắt sự kiện cài đặt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
    });

    const checkDeviceAndMode = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        
        // Nhận diện thiết bị Mobile/Tablet
        const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        setIsMobile(mobile);
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));

        const isStandalone = 
            window.matchMedia('(display-mode: standalone)').matches || 
            (window.navigator as any).standalone || 
            document.referrer.includes('android-app://');

        // 🟢 LOGIC MỚI:
        // - Nếu là Mobile mà chưa cài App -> HIỆN THÔNG BÁO (Ép cài)
        // - Nếu là Desktop -> KHÔNG HIỆN (Cho dùng luôn để đỡ phiền)
        if (mobile && !isStandalone) {
            setShowPrompt(true);
        } else {
            setShowPrompt(false);
        }
    };

    checkDeviceAndMode();
  }, []);

  const handleInstallClick = async () => {
      if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
              setDeferredPrompt(null);
              setShowPrompt(false);
          }
      } else {
          // Fallback cho Desktop nếu lỡ lọt vào đây hoặc thiết bị lạ
          alert('Vui lòng tìm nút "Cài đặt" hoặc "Thêm vào màn hình chính" trên menu trình duyệt của bạn.');
      }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 text-center">
        
        {/* Logo */}
        <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-[#C69C6D] to-[#5D4037] flex items-center justify-center shadow-[0_0_40px_rgba(198,156,109,0.3)] animate-bounce">
            {isMobile ? <Smartphone className="text-white w-10 h-10" /> : <Monitor className="text-white w-10 h-10" />}
        </div>
        
        <h2 className="text-2xl font-bold text-[#F5E6D3] mb-4 uppercase tracking-widest">
            Cài Đặt Ứng Dụng
        </h2>
        
        <p className="text-gray-400 text-sm md:text-base max-w-md mb-8 leading-relaxed">
            Để có trải nghiệm mượt mà và toàn màn hình, vui lòng cài đặt ứng dụng vào thiết bị của bạn.
        </p>
        
        {isIOS ? (
             <div className="bg-[#1a120f] border border-[#8B5E3C]/30 p-5 rounded-xl max-w-xs w-full text-left space-y-3 shadow-2xl">
                <div className="flex items-center gap-3 text-[#C69C6D] text-sm font-bold">
                    <Share size={20} />
                    <span>Bước 1: Nhấn nút Chia sẻ</span>
                </div>
                <div className="w-full h-[1px] bg-[#8B5E3C]/20"></div>
                <div className="flex items-center gap-3 text-[#F5E6D3] text-sm font-bold">
                    <PlusSquare size={20} />
                    <span>Bước 2: Chọn "Thêm vào MH chính"</span>
                </div>
             </div>
        ) : (
            <div className="w-full max-w-xs space-y-3">
                <button 
                    onClick={handleInstallClick}
                    className="w-full py-4 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(198,156,109,0.4)] flex items-center justify-center gap-2"
                >
                    <Download size={20} strokeWidth={2.5} /> CÀI ĐẶT NGAY
                </button>
                
                {/* Nút bỏ qua tạm thời (chỉ hiện nếu script nhận diện sai) */}
                <button 
                    onClick={() => setShowPrompt(false)}
                    className="text-[10px] text-gray-500 hover:text-gray-300 mt-4 underline decoration-dotted"
                >
                    Tiếp tục sử dụng trình duyệt
                </button>
            </div>
        )}
    </div>
  );
}
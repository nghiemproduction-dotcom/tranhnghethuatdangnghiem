'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, Smartphone, Monitor } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ForceFullScreen() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // 1. LOGIC TÍNH CHIỀU CAO "BẤT TỬ" (Fix lỗi hở trắng trên Safari/Chrome Mobile)
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
  // 🟢 Quan trọng: Đã thêm pathname vào dependency array để check lại mỗi khi đổi trang
  useEffect(() => {
    // Bắt sự kiện cài đặt (Android/Desktop)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const checkDeviceAndMode = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      
      // Nhận diện thiết bị Mobile/Tablet
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(mobile);
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));

      // Kiểm tra xem đã cài app chưa (Standalone mode)
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone || 
        document.referrer.includes('android-app://');

      // 🟢 LOGIC MỚI: Chỉ ép cài đặt nếu đang ở trong các trang nội bộ (Admin, Quản lý, Nhân viên)
      // Các trang công khai như Trang chủ (/), Đặt hàng (/dathang) sẽ KHÔNG hiện.
      const isInternalPage = 
        pathname.startsWith('/phong') || 
        pathname.startsWith('/dashboard') || 
        pathname.startsWith('/admin');

      if (mobile && !isStandalone && isInternalPage) {
        setShowPrompt(true); // Chỉ hiện khi nhân viên vào làm việc
      } else {
        setShowPrompt(false); // Khách xem trang chủ thì tha cho họ
      }
    };

    checkDeviceAndMode();

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [pathname]); // 👈 Mấu chốt ở đây: Chạy lại khi pathname thay đổi

  const handleInstallClick = async () => {
      if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
              setDeferredPrompt(null);
              setShowPrompt(false);
          }
      } else {
          // Fallback cho Desktop/iOS
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
        
        <h2 className="text-2xl font-bold text-[#F5E6D3] mb-4 uppercase tracking-widest font-serif">
            Hệ Thống Nội Bộ
        </h2>
        
        <p className="text-gray-400 text-sm md:text-base max-w-md mb-8 leading-relaxed">
            Để đảm bảo hiệu năng và trải nghiệm làm việc tốt nhất, vui lòng cài đặt ứng dụng vào thiết bị.
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
                
                <button 
                    onClick={() => setShowPrompt(false)}
                    className="text-[10px] text-gray-500 hover:text-gray-300 mt-4 underline decoration-dotted"
                >
                    Chỉ dùng tạm thời (Không khuyến khích)
                </button>
            </div>
        )}
    </div>
  );
}
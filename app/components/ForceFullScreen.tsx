"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Share,
  PlusSquare,
  Smartphone,
  Monitor,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function ForceFullScreen() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // 1. LOGIC TÍNH CHIỀU CAO "BẤT TỬ" (Fix lỗi hở trắng trên Safari/Chrome Mobile)
  useEffect(() => {
    const setAppHeight = () => {
      const vh = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${vh}px`);
    };

    setAppHeight();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setAppHeight);
      window.visualViewport.addEventListener("scroll", setAppHeight);
    } else {
      window.addEventListener("resize", setAppHeight);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setAppHeight);
        window.visualViewport.removeEventListener("scroll", setAppHeight);
      } else {
        window.removeEventListener("resize", setAppHeight);
      }
    };
  }, []);

  // 2. LOGIC KIỂM TRA & ÉP CÀI ĐẶT (ĐÃ NÂNG CẤP THÔNG MINH HƠN)
  useEffect(() => {
    // Kiểm tra xem người dùng đã bấm "Ẩn vĩnh viễn" chưa
    const isDismissed =
      typeof window !== "undefined" &&
      localStorage.getItem("PWA_PROMPT_DISMISSED") === "true";
    if (isDismissed) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const checkDeviceAndMode = () => {
      // 🟢 CHECK 1: Thiết bị
      const userAgent = window.navigator.userAgent.toLowerCase();
      const mobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        );
      setIsMobile(mobile);
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));

      // 🟢 CHECK 2: Standalone Mode (Nâng cấp)
      // Thêm nhiều điều kiện check hơn để tránh bắt nhầm
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      // 🟢 CHECK 3: Heuristic chiều cao (Quan trọng)
      // Nếu mất thanh địa chỉ (chiều cao cửa sổ > 90% chiều cao thiết bị) -> Coi như đã Fullscreen
      const isLikelyFullscreen =
        window.innerHeight > window.screen.height * 0.9;

      // 🟢 CHECK 4: Trang nội bộ
      const isInternalPage =
        pathname.startsWith("/phong") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin");

      // 🛑 LOGIC QUYẾT ĐỊNH HIỆN POPUP
      // Chỉ hiện nếu: Là Mobile + Chưa cài + Trang nội bộ + Chưa Fullscreen thực sự
      if (mobile && !isStandalone && !isLikelyFullscreen && isInternalPage) {
        setShowPrompt(true);
      } else {
        setShowPrompt(false);
      }
    };

    // Check ngay lập tức và check lại khi resize/focus (đề phòng xoay màn hình)
    checkDeviceAndMode();
    window.addEventListener("resize", checkDeviceAndMode);
    window.addEventListener("focus", checkDeviceAndMode);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("resize", checkDeviceAndMode);
      window.removeEventListener("focus", checkDeviceAndMode);
    };
  }, [pathname]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } else {
      // Fallback cho iOS hoặc khi trình duyệt chặn prompt
      alert(
        'Vui lòng tìm nút "Cài đặt" hoặc "Thêm vào màn hình chính" trên menu trình duyệt.'
      );
    }
  };

  // 🟢 HÀM XỬ LÝ KHI NGƯỜI DÙNG KÊU "TAO CÀI RỒI MÀ" (CỨU TINH)
  const handleDismiss = () => {
    // Lưu vào localStorage để không bao giờ hiện lại nữa trên máy này
    localStorage.setItem("PWA_PROMPT_DISMISSED", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 text-center">
      {/* Nút tắt khẩn cấp (Góc trên phải) - Cho trường hợp muốn tắt tạm thời */}
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-4 right-4 text-white/30 hover:text-white p-2"
      >
        <XCircle size={24} />
      </button>

      <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-[#C69C6D] to-[#5D4037] flex items-center justify-center shadow-[0_0_40px_rgba(198,156,109,0.3)] animate-bounce">
        {isMobile ? (
          <Smartphone className="text-white w-10 h-10" />
        ) : (
          <Monitor className="text-white w-10 h-10" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-[#F5E6D3] mb-4 uppercase tracking-widest font-serif">
        Hệ Thống Nội Bộ
      </h2>

      <p className="text-gray-400 text-sm md:text-base max-w-md mb-8 leading-relaxed">
        Để đảm bảo hiệu năng và trải nghiệm làm việc tốt nhất, vui lòng cài đặt
        ứng dụng vào thiết bị.
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
        </div>
      )}

      {/* 🟢 NÚT CHO NGƯỜI ĐÃ CÀI RỒI - GIẢI PHÁP CUỐI CÙNG */}
      <button
        onClick={handleDismiss}
        className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors text-xs font-medium border border-white/5"
      >
        <CheckCircle2 size={14} />
        Tôi đã cài rồi / Không hiện lại nữa
      </button>
    </div>
  );
}

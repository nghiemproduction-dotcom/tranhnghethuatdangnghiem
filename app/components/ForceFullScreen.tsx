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

  // 2. LOGIC KIỂM TRA & ÉP CÀI ĐẶT (ĐÃ NÂNG CẤP)
  useEffect(() => {
    // Kiểm tra xem người dùng đã bấm "Ẩn vĩnh viễn" chưa
    const isDismissed =
      typeof window !== "undefined" &&
      localStorage.getItem("PWA_PROMPT_DISMISSED") === "true";

    if (isDismissed) return;

    // --- A. Xử lý cho Android/Chrome (Sự kiện chuẩn) ---
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Nếu chưa cài đặt, hiện popup ngay
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // --- B. Xử lý cho iOS và check trạng thái ---
    const checkDeviceAndMode = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();

      // 🟢 Detect Mobile chuẩn hơn
      const mobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        );
      setIsMobile(mobile);

      // 🟢 Detect iOS chuẩn hơn (Bao gồm cả iPad Pro đời mới)
      const isIOSDevice =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      setIsIOS(isIOSDevice);

      // 🟢 Kiểm tra đã cài đặt (Standalone) chưa?
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      // 🟢 Điều kiện hiển thị:
      // 1. Phải là trang nội bộ (để không làm phiền ở trang login/home)
      const isInternalPage =
        pathname.startsWith("/phong") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin");

      // 2. Nếu là iOS và chưa cài đặt -> Hiện luôn (Vì iOS không có sự kiện beforeinstallprompt)
      // 3. Nếu là Android -> Đã được xử lý bởi sự kiện 'beforeinstallprompt' ở trên
      if (isIOSDevice && !isStandalone && isInternalPage) {
        setShowPrompt(true);
      }

      // Nếu đã cài rồi thì tắt prompt (để chắc chắn)
      if (isStandalone) {
        setShowPrompt(false);
      }
    };

    checkDeviceAndMode();

    // Check lại khi resize (xoay màn hình)
    window.addEventListener("resize", checkDeviceAndMode);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("resize", checkDeviceAndMode);
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
      // Fallback khi trình duyệt chặn hoặc lỗi
      alert(
        'Vui lòng tìm nút "Cài đặt" hoặc "Thêm vào màn hình chính" (Add to Home Screen) trong menu trình duyệt.'
      );
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("PWA_PROMPT_DISMISSED", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 text-center">
      {/* Nút tắt khẩn cấp */}
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-4 right-4 text-white/30 hover:text-white p-2"
      >
        <XCircle size={24} />
      </button>

      <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-[#C69C6D] to-[#5D4037] flex items-center justify-center shadow-[0_0_40px_rgba(198,156,109,0.3)] animate-bounce">
        {isIOS ? (
          <Smartphone className="text-white w-10 h-10" />
        ) : (
          <Download className="text-white w-10 h-10" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-[#F5E6D3] mb-4 uppercase tracking-widest font-serif">
        Cài Đặt Ứng Dụng
      </h2>

      <p className="text-gray-400 text-sm md:text-base max-w-md mb-8 leading-relaxed">
        {isIOS
          ? "Để ứng dụng hoạt động ổn định và toàn màn hình trên iPhone/iPad, vui lòng làm theo hướng dẫn dưới đây."
          : "Cài đặt ứng dụng vào thiết bị để có trải nghiệm tốt nhất, không bị lỗi giao diện."}
      </p>

      {isIOS ? (
        <div className="bg-[#1a120f] border border-[#8B5E3C]/30 p-5 rounded-xl max-w-xs w-full text-left space-y-4 shadow-2xl">
          <div className="flex items-center gap-3 text-[#C69C6D] text-sm font-bold">
            <Share size={20} />
            <span>1. Nhấn nút Chia sẻ (Share)</span>
          </div>
          <div className="w-full h-[1px] bg-[#8B5E3C]/20"></div>
          <div className="flex items-center gap-3 text-[#F5E6D3] text-sm font-bold">
            <PlusSquare size={20} />
            <span>2. Chọn "Thêm vào MH chính"</span>
          </div>
          <p className="text-xs text-white/40 italic mt-2 text-center">
            (Add to Home Screen)
          </p>
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
        className="mt-8 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors text-xs font-medium border border-white/5"
      >
        <CheckCircle2 size={14} />
        Đã cài đặt / Không hiện lại
      </button>
    </div>
  );
}

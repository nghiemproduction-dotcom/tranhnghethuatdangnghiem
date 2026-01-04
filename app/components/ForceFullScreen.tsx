"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Share,
  PlusSquare,
  Smartphone,
  XCircle,
  CheckCircle2,
  Globe,
  MoreHorizontal,
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function ForceFullScreen() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false); // Detect Zalo/FB
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // 1. LOGIC TÍNH CHIỀU CAO "BẤT TỬ" (Giữ nguyên vì đã tốt)
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

  // 2. LOGIC KIỂM TRA THÔNG MINH
  useEffect(() => {
    // Check nếu người dùng đã "Cấm hiện lại"
    const isDismissed =
      typeof window !== "undefined" &&
      localStorage.getItem("PWA_PROMPT_DISMISSED") === "true";

    if (isDismissed) return;

    // A. Bắt sự kiện cài đặt của Chrome (Android/PC)
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Chỉ hiện popup nếu đang ở các trang nội bộ
      if (checkIsInternalPage()) setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // B. Logic kiểm tra thiết bị & Môi trường
    const checkDeviceAndMode = () => {
      const userAgent = window.navigator.userAgent || window.navigator.vendor;

      // 1. Check xem có phải Zalo/Facebook/Instagram không? (QUAN TRỌNG)
      // Các app này dùng browser riêng (webview) rất tù, không cài app được
      const isInApp = /Zalo|FBAN|FBAV|Instagram/.test(userAgent);
      setIsInAppBrowser(isInApp);

      // 2. Check iOS
      const isIOSDevice =
        /iPad|iPhone|iPod/.test(userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      setIsIOS(isIOSDevice);

      // 3. Check xem đã cài app chưa (Standalone mode)
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      // 4. QUYẾT ĐỊNH HIỂN THỊ
      const isInternal = checkIsInternalPage();

      if (isStandalone) {
        setShowPrompt(false); // Đã cài rồi thì ẩn luôn
      } else if (isInternal) {
        // Nếu chưa cài và đang ở trang nội bộ
        if (isInApp) {
          setShowPrompt(true); // Zalo/FB -> Hiện cảnh báo bắt mở browser ngoài
        } else if (isIOSDevice) {
          setShowPrompt(true); // iOS -> Hiện hướng dẫn
        }
        // Android/Chrome sẽ được handle bởi sự kiện `beforeinstallprompt` ở trên
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

  // Hàm phụ kiểm tra trang nội bộ
  const checkIsInternalPage = () => {
    return (
      pathname.startsWith("/phong") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/admin")
    );
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } else {
      // Fallback cho PC hoặc browser lạ
      alert("Hãy tìm biểu tượng Cài đặt trên thanh địa chỉ trình duyệt.");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("PWA_PROMPT_DISMISSED", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  // --- RENDER GIAO DIỆN ---

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 text-center">
      {/* Nút đóng */}
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-4 right-4 text-white/30 hover:text-white p-2"
      >
        <XCircle size={30} />
      </button>

      {/* Icon chính */}
      <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-[#C69C6D] to-[#5D4037] flex items-center justify-center shadow-[0_0_40px_rgba(198,156,109,0.3)] animate-bounce">
        {isInAppBrowser ? (
          <Globe className="text-white w-10 h-10" />
        ) : isIOS ? (
          <Smartphone className="text-white w-10 h-10" />
        ) : (
          <Download className="text-white w-10 h-10" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-[#F5E6D3] mb-4 uppercase tracking-widest font-serif">
        {isInAppBrowser ? "Mở Trình Duyệt" : "Cài Đặt Ứng Dụng"}
      </h2>

      <p className="text-gray-400 text-sm md:text-base max-w-md mb-8 leading-relaxed">
        {isInAppBrowser
          ? "Bạn đang dùng Zalo/Facebook. Để ứng dụng hoạt động ổn định, vui lòng mở bằng trình duyệt (Safari/Chrome)."
          : isIOS
          ? "Để full màn hình và không bị lỗi trên iPhone, hãy thêm vào màn hình chính."
          : "Cài đặt ứng dụng vào thiết bị để có trải nghiệm tốt nhất, không bị lỗi giao diện."}
      </p>

      {/* KHỐI NỘI DUNG TUỲ THEO THIẾT BỊ */}
      
      {/* 1. Trường hợp Zalo/FB */}
      {isInAppBrowser && (
        <div className="bg-[#1a120f] border border-red-500/30 p-5 rounded-xl max-w-xs w-full text-left space-y-4 shadow-2xl animate-pulse">
           <div className="flex items-center gap-3 text-[#F5E6D3] text-sm font-bold">
            <MoreHorizontal size={20} />
            <span>1. Nhấn vào dấu 3 chấm góc trên</span>
          </div>
          <div className="w-full h-[1px] bg-[#8B5E3C]/20"></div>
          <div className="flex items-center gap-3 text-[#C69C6D] text-sm font-bold">
            <Globe size={20} />
            <span>2. Chọn "Mở bằng trình duyệt"</span>
          </div>
        </div>
      )}

      {/* 2. Trường hợp iOS (iPhone) */}
      {!isInAppBrowser && isIOS && (
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
        </div>
      )}

      {/* 3. Trường hợp Android/Chrome */}
      {!isInAppBrowser && !isIOS && (
        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={handleInstallClick}
            className="w-full py-4 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(198,156,109,0.4)] flex items-center justify-center gap-2"
          >
            <Download size={20} strokeWidth={2.5} /> CÀI ĐẶT NGAY
          </button>
        </div>
      )}

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
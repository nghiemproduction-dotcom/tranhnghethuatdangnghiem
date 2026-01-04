"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, ArrowRight, LogIn, Loader2 } from "lucide-react";
import CongDangNhap from "@/app/CongDangNhap/CongDangNhap";
import GoogleDich from "@/app/ThuVien/GoogleDich";
import { AuthService } from "@/app/CongDangNhap/AuthService";
import { useAppSettings } from "@/app/ThuVien/AppSettingsContext";
import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { getRedirectUrl } from "@/app/CongDangNhap/RoleRedirectService";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

function TrangChuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useAppSettings();

  const [hienPopupLogin, setHienPopupLogin] = useState(false);
  const [nguoiDung, setNguoiDung] = useState<any>(null);
  const [loiChao, setLoiChao] = useState("");
  const [showGreeting, setShowGreeting] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [daKiemTraLogin, setDaKiemTraLogin] = useState(false);

  // 1. ZOMBIE KILLER - Xử lý khi vừa Logout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("logout")) {
      console.log("🛑 [ZOMBIE KILLER] Logout detected.");
      setNguoiDung(null);
      setDaKiemTraLogin(true); // Cho phép render UI ngay
      setIsCheckingAuth(false);
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie = "VISITOR_MODE=; Path=/; Max-Age=0; SameSite=Lax";
      }
      window.history.replaceState({}, "", "/");
      return;
    }
  }, []);

  // 2. CHECK SESSION + SAFETY TIMER (FIX LỖI MÀN HÌNH ĐEN)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("logout")) return;

    // 🟢 TIMER CỨU HỘ: Sau 3s nếu chưa check xong thì coi như chưa login để hiện nút
    const safetyTimer = setTimeout(() => {
      setDaKiemTraLogin((prev) => {
        if (!prev) {
          console.warn("⚠️ Login check timeout - Force UI render");
          setNguoiDung(null);
          setIsCheckingAuth(false);
          return true; // Bắt buộc render UI
        }
        return prev;
      });
    }, 3000);

    const checkSession = async () => {
      setIsCheckingAuth(true);
      try {
        // Dọn rác localStorage
        const cached = localStorage.getItem("USER_INFO");
        if (cached === "undefined") localStorage.removeItem("USER_INFO");
        else if (cached) {
          try {
            JSON.parse(cached);
          } catch {
            localStorage.removeItem("USER_INFO");
          }
        }

        // Hỏi Supabase
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          console.log("🚫 No session found.");
          setNguoiDung(null);
          localStorage.removeItem("USER_INFO");
          localStorage.removeItem("USER_ROLE");
        } else {
          console.log("✅ Session valid:", session.user.email);
          const user = await AuthService.getCurrentUser();
          if (user) {
            setNguoiDung(user);
            localStorage.setItem("USER_INFO", JSON.stringify(user));
          } else {
            setNguoiDung(null);
          }
        }
      } catch (e) {
        console.error("Session check error:", e);
        setNguoiDung(null);
      } finally {
        setIsCheckingAuth(false);
        setDaKiemTraLogin(true); // Đánh dấu đã xong
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") await checkSession();
      else if (event === "SIGNED_OUT") {
        setNguoiDung(null);
        localStorage.removeItem("USER_INFO");
        localStorage.removeItem("USER_ROLE");
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer); // Xóa timer khi unmount
    };
  }, []);

  // 3. AUTO-REDIRECT
  useEffect(() => {
    if (!nguoiDung || isRedirecting) return;
    if (new URLSearchParams(window.location.search).get("logout")) return;
    handleMainAction();
  }, [nguoiDung]);

  // 4. LỜI CHÀO
  useEffect(() => {
    const name = nguoiDung?.ho_ten || (language === "vi" ? "Khách" : "Guest");
    const h = new Date().getHours();
    let timeGreeting = language === "vi" ? "Chào buổi tối" : "Good evening";
    if (h >= 5 && h < 11)
      timeGreeting = language === "vi" ? "Chào buổi sáng" : "Good morning";
    else if (h >= 11 && h < 14)
      timeGreeting = language === "vi" ? "Chào buổi trưa" : "Good afternoon";
    else if (h >= 14 && h < 18)
      timeGreeting = language === "vi" ? "Chào buổi chiều" : "Good afternoon";

    setLoiChao(`${timeGreeting}, ${name}!`);
    setShowGreeting(true);
    const timer = setTimeout(() => setShowGreeting(false), 5000);
    return () => clearTimeout(timer);
  }, [nguoiDung, language]);

  const handleGuestVisit = () => {
    document.cookie = "VISITOR_MODE=1; path=/; max-age=86400; SameSite=Lax";
    router.push("/trangchu");
  };

  const handleMainAction = async () => {
    if (!nguoiDung) {
      setHienPopupLogin(true);
      return;
    }
    setIsRedirecting(true);
    try {
      const role =
        nguoiDung.role ||
        nguoiDung.vi_tri_normalized ||
        nguoiDung.phan_loai_normalized ||
        "khach";
      const type = nguoiDung.userType || "khach_hang";
      const targetUrl = await getRedirectUrl(type, role);
      router.push(targetUrl);
    } catch (e) {
      console.error("Redirect error:", e);
      setIsRedirecting(false);
      setNguoiDung(null);
    }
  };

  const bgVersion = React.useMemo(() => Date.now(), []);
  const bgMobile = `${BASE_IMG_URL}/login-mobile.jpg?v=${bgVersion}`;
  const bgDesktop = `${BASE_IMG_URL}/login-desktop.jpg?v=${bgVersion}`;

  // MÀN HÌNH CHỜ (Đã có timeout bảo vệ nên sẽ không treo mãi)
  if (!daKiemTraLogin)
    return <div className="fixed inset-0 bg-[#050505] z-50" />;

  return (
    <div className="relative h-app w-full bg-[#050505] text-[#F5F5F5] overflow-hidden font-sans flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none">
        {SUPABASE_URL && (
          <>
            <img
              src={bgMobile}
              className="absolute inset-0 w-full h-full object-cover md:hidden"
              loading="eager"
              alt="bg"
            />
            <img
              src={bgDesktop}
              className="absolute inset-0 w-full h-full object-cover hidden md:block"
              loading="eager"
              alt="bg"
            />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      <GoogleDich />

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center translate-y-[10%] p-4">
        <div className="w-full max-w-[95%] md:max-w-2xl flex flex-col items-center gap-6 md:gap-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center w-full">
            <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
              <MapPin size={16} className="text-yellow-500" />
              <span className="text-sm font-bold tracking-[0.3em] uppercase text-white drop-shadow-md">
                {language === "vi"
                  ? "CẦN THƠ / VIỆT NAM"
                  : "CAN THO / VIET NAM"}
              </span>
            </div>
            <div className="relative">
              <h1
                className="font-thin tracking-widest leading-none text-white super-text-shadow whitespace-nowrap"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                {language === "vi" ? "ĐĂNG NGHIÊM" : "DANG NGHIEM"}
              </h1>
              <p
                className="font-serif italic text-yellow-500 mt-2 tracking-wide font-medium drop-shadow-md"
                style={{ fontSize: "clamp(14px, 1.5vw, 1.2rem)" }}
              >
                Art Gallery
              </p>
            </div>
            <div className="h-8 flex items-center justify-center mt-2">
              {showGreeting && (
                <p className="text-sm md:text-base text-white/80 animate-pulse font-serif italic">
                  {loiChao}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 w-full">
            <button
              onClick={handleGuestVisit}
              className="group flex flex-col items-center gap-3 opacity-90 hover:opacity-100 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-white/5 text-white group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500 ease-out shadow-lg border border-white/20 hover:border-yellow-400">
                <ArrowRight
                  size={24}
                  className="group-hover:-rotate-45 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-bold tracking-[0.2em] text-white group-hover:text-yellow-400 transition-colors drop-shadow-lg">
                  {language === "vi" ? "THAM QUAN" : "VISIT"}
                </span>
              </div>
            </button>

            <div className="hidden sm:block w-[1px] h-12 bg-white/20" />

            <button
              onClick={handleMainAction}
              disabled={isCheckingAuth || isRedirecting}
              className="group flex flex-col items-center gap-3 opacity-90 hover:opacity-100 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-transparent text-gray-400 group-hover:bg-white group-hover:text-black transition-all duration-500 ease-out shadow-lg border border-white/20 hover:border-white">
                {isCheckingAuth || isRedirecting ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : nguoiDung ? (
                  <ArrowRight size={24} />
                ) : (
                  <LogIn size={24} />
                )}
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-bold tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors drop-shadow-lg">
                  {isCheckingAuth
                    ? "..."
                    : isRedirecting
                    ? language === "vi"
                      ? "ĐANG VÀO..."
                      : "LOADING..."
                    : nguoiDung
                    ? language === "vi"
                      ? "VÀO PHÒNG"
                      : "MY ROOM"
                    : language === "vi"
                    ? "ĐĂNG NHẬP"
                    : "LOGIN"}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-8 md:mt-12 opacity-40">
          <p className="text-sm tracking-[0.2em] uppercase font-bold text-gray-500 drop-shadow-sm">
            © {new Date().getFullYear()} DANG NghiemArt
          </p>
        </div>
      </div>

      <CongDangNhap
        isOpen={hienPopupLogin}
        onClose={() => setHienPopupLogin(false)}
      />

      <style jsx global>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1.2s ease-out forwards;
        }
        .super-text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9),
            0 8px 16px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}

export default function TrangChuDashboard() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[100dvh] bg-[#050505] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C69C6D]"></div>
        </div>
      }
    >
      <TrangChuContent />
    </Suspense>
  );
}

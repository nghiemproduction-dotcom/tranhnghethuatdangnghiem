"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { AuthService } from "@/app/CongDangNhap/AuthService";
import { getRedirectUrl } from "@/app/CongDangNhap/RoleRedirectService";
import {
  X,
  Square,
  CheckSquare,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Mail,
  ArrowLeft,
  UserPlus,
  KeyRound,
} from "lucide-react";
import { Z_INDEX } from "@/app/constants/zIndex";
import RegisterForm from "@/app/components/RegisterForm"; // 🟢 Import Form mới

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

// Hiệu ứng nền (Giữ nguyên)
const NenHieuUng = ({ isModalMode }: { isModalMode: boolean }) => {
  const bgMobile = `${BASE_IMG_URL}/login-mobile.jpg`;
  const bgTablet = `${BASE_IMG_URL}/login-tablet.jpg`;
  const bgDesktop = `${BASE_IMG_URL}/login-desktop.jpg`;

  return (
    <div
      className={`absolute inset-0 bg-[#050505] overflow-hidden ${
        isModalMode ? "rounded-2xl" : ""
      }`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center md:hidden transition-opacity duration-700"
        style={{ backgroundImage: `url('${bgMobile}')` }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center hidden md:block lg:hidden transition-opacity duration-700"
        style={{ backgroundImage: `url('${bgTablet}')` }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center hidden lg:block transition-opacity duration-700"
        style={{ backgroundImage: `url('${bgDesktop}')` }}
      />
      <div
        className={`absolute inset-0 bg-black/60 ${
          isModalMode ? "bg-black/70" : ""
        }`}
      />
      <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[100px] mix-blend-overlay" />
    </div>
  );
};

// 🟢 Định nghĩa Interface để fix lỗi TypeScript cho ONhapLieu
interface ONhapLieuProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  showEye?: boolean;
  isPasswordVisible?: boolean;
  onToggleEye?: () => void;
}

// Ô nhập liệu (Giữ nguyên)
const ONhapLieu = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  showEye = false,
  isPasswordVisible = false,
  onToggleEye,
}: ONhapLieuProps) => {
  const inputType = showEye ? (isPasswordVisible ? "text" : "password") : type;

  return (
    <div className="group relative w-full">
      <label
        htmlFor={id}
        className="block text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-md ml-1"
      >
        {label}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/40 hover:bg-black/60 focus:bg-black/80 text-white text-lg font-bold tracking-wider border border-white/20 focus:border-[#C69C6D] rounded-xl px-5 py-4 outline-none transition-all duration-300 placeholder-transparent shadow-lg"
          autoComplete="off"
        />
        {showEye && (
          <button
            type="button"
            onClick={onToggleEye}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#C69C6D] transition-colors p-1"
            tabIndex={-1}
          >
            {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      <div className="absolute bottom-0 left-5 right-5 h-[1px] bg-[#C69C6D] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
};

// Nút xác nhận (Giữ nguyên)
const NutXacNhan = ({
  isLoading,
  mode = "login",
}: {
  isLoading: boolean;
  mode?: "login" | "register" | "forgotPassword";
}) => {
  const getButtonText = () => {
    switch (mode) {
      // case 'register': return 'ĐĂNG KÝ'; // Đã chuyển sang form riêng
      case "forgotPassword":
        return "GỬI EMAIL";
      default:
        return "LOGIN";
    }
  };
  const getIcon = () => {
    switch (mode) {
      // case 'register': return <UserPlus size={28} ... />;
      case "forgotPassword":
        return (
          <Mail
            size={28}
            className="group-hover:scale-110 transition-transform duration-500"
            strokeWidth={2}
          />
        );
      default:
        return (
          <ArrowRight
            size={28}
            className="group-hover:-rotate-45 transition-transform duration-500"
            strokeWidth={2}
          />
        );
    }
  };

  return (
    <button
      type="submit"
      disabled={isLoading}
      className="group mt-8 flex flex-col items-center gap-3 opacity-90 hover:opacity-100 transition-all disabled:opacity-50 mx-auto"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-transparent border-2 border-white/30 text-white group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-500 ease-out shadow-xl">
        {isLoading ? <Loader2 className="animate-spin" size={28} /> : getIcon()}
      </div>
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold tracking-[0.3em] text-white group-hover:text-yellow-400 transition-colors drop-shadow-md">
          {isLoading ? "..." : getButtonText()}
        </span>
      </div>
    </button>
  );
};

// Component Chính
export default function CongDangNhap({
  isOpen,
  onClose,
  isGateKeeper = false,
  initialMode = "login",
}: {
  isOpen?: boolean;
  onClose?: () => void;
  isGateKeeper?: boolean;
  initialMode?: "login" | "register";
}) {
  console.log("🎨 CongDangNhap MOUNTED/RENDERED", {
    isOpen,
    isGateKeeper,
    initialMode,
  });

  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "forgotPassword">(
    "login"
  );
  const [user, setUser] = useState({ name: "", phone: "" }); // name=email, phone=password
  const [flags, setFlags] = useState({ loading: false, anim: false });
  const [isError, setIsError] = useState(false);

  const [wantFullScreen, setWantFullScreen] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPhone, setShowPhone] = useState(false);

  // Dialog states
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const isModal = typeof isOpen === "boolean";

  const isVipCustomer = (phanLoai: string) =>
    !!phanLoai && phanLoai.trim().length > 0;

  // 🟢 UPDATE: Set mode từ prop initialMode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || "login");
      const timer = setTimeout(
        () => setFlags((p) => ({ ...p, anim: true })),
        50
      );
      return () => clearTimeout(timer);
    } else {
      setFlags((p) => ({ ...p, anim: false }));
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("SAVED_EMAIL");
    if (savedEmail) {
      try {
        const parsed = JSON.parse(savedEmail);
        if (parsed.email) setUser((prev) => ({ ...prev, name: parsed.email }));
        setRememberMe(true);
      } catch (e) {
        setRememberMe(false);
      }
    }
    const savedPref = localStorage.getItem("GLOBAL_FULLSCREEN_PREF");
    if (savedPref !== null) setWantFullScreen(savedPref === "true");
  }, []);

  if (isModal && !isOpen) return null;

  const triggerFullScreen = () => {
    try {
      const elem = document.documentElement as any;
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    } catch (err) {
      console.warn("Fullscreen error:", err);
    }
  };

  // --- LOGIC LOGIN (GIỮ NGUYÊN) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined")
      localStorage.setItem(
        "GLOBAL_FULLSCREEN_PREF",
        wantFullScreen ? "true" : "false"
      );
    if (wantFullScreen) triggerFullScreen();

    setFlags((p) => ({ ...p, loading: true }));
    setIsError(false);

    const email = user.name.trim().toLowerCase();
    const password = user.phone.trim();

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(`Lỗi đăng nhập: ${authError.message}`);
      if (!authData.session) throw new Error("Session không được tạo.");

      const finalUser = await AuthService.getUserByEmailWithRpc(email);
      if (!finalUser) throw new Error("Không tìm thấy hồ sơ.");

      let finalRole = "khach";
      if (finalUser.userType === "nhan_su") {
        finalRole = (finalUser as any).vi_tri_normalized || "parttime";
      } else {
        const phanLoai = finalUser.phan_loai || "";
        if (!isVipCustomer(phanLoai))
          throw new Error("Tài khoản này không được phép truy cập.");
        finalRole = (finalUser as any).phan_loai_normalized || "moi";
      }

      if (rememberMe)
        localStorage.setItem("SAVED_EMAIL", JSON.stringify({ email }));
      else localStorage.removeItem("SAVED_EMAIL");

      const userInfo = {
        id: finalUser.id,
        ho_ten: (finalUser as any).ten_hien_thi || finalUser.ho_ten || email,
        email: email,
        role: finalRole,
        role_normalized:
          (finalUser as any).vi_tri_normalized ||
          (finalUser as any).phan_loai_normalized ||
          finalRole,
        userType: finalUser.userType,
        avatar_url: (finalUser as any).hinh_anh,
      };

      localStorage.setItem("USER_INFO", JSON.stringify(userInfo));
      localStorage.setItem("USER_ROLE", finalRole);
      document.cookie = "VISITOR_MODE=; Path=/; Max-Age=0; SameSite=Lax";

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const targetUrl = await getRedirectUrl(finalUser.userType, finalRole);

      if (isModal && onClose) onClose();
      router.push(targetUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || "Lỗi không xác định");
      setShowErrorDialog(true);
      setIsError(true);
    } finally {
      setFlags((p) => ({ ...p, loading: false }));
    }
  };

  // Logic Quên mật khẩu (GIỮ NGUYÊN)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlags((p) => ({ ...p, loading: true }));
    const email = user.name.trim().toLowerCase();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccessMessage(
        "Đã gửi link đặt lại mật khẩu! Vui lòng kiểm tra email."
      );
      setShowSuccessDialog(true);
      setTimeout(() => {
        setShowSuccessDialog(false);
        setMode("login");
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
      setShowErrorDialog(true);
    } finally {
      setFlags((p) => ({ ...p, loading: false }));
    }
  };

  const handleClose = () => {
    if (isGateKeeper) {
      router.push("/");
      return;
    }
    setFlags((p) => ({ ...p, anim: false }));
    setTimeout(() => onClose && onClose(), 300);
  };

  // 🟢 ĐIỀU CHỈNH ĐỘ RỘNG MODAL
  const modalWidthClass =
    mode === "register"
      ? "max-w-4xl h-auto md:h-[650px]"
      : "max-w-screen-xl h-full";

  return (
    <div
      className={`fixed inset-0 w-screen h-[100dvh] font-sans text-white overflow-hidden bg-black/90 backdrop-blur-sm flex items-center justify-center`}
      style={{ zIndex: Z_INDEX.modal }}
    >
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <NenHieuUng isModalMode={isModal} />
      </div>

      {/* Main Container */}
      <div
        className={`relative w-full ${modalWidthClass} mx-auto flex flex-col items-center justify-center transition-all duration-700 ease-out transform 
                  ${
                    isModal
                      ? flags.anim
                        ? "opacity-100 blur-0 scale-100"
                        : "opacity-0 blur-xl scale-110"
                      : "opacity-100"
                  }
            `}
      >
        {/* Close Button */}
        {isModal && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors p-2 z-50 bg-black/20 rounded-full active:scale-95"
          >
            <X size={24} className="md:w-8 md:h-8" strokeWidth={1.5} />
          </button>
        )}

        {/* 🟢 SWITCH CONTENT: REGISTER FORM vs LOGIN FORM */}
        {mode === "register" ? (
          // 🟢 FORM ĐĂNG KÝ MỚI (TÍCH HỢP)
          <div className="w-full h-full bg-[#0a0a0a] md:border border-[#C69C6D]/30 rounded-none md:rounded-2xl shadow-2xl overflow-hidden relative z-10 flex">
            <RegisterForm
              onSwitchToLogin={() => setMode("login")}
              onSuccess={() => {
                /* Có thể thêm logic redirect hoặc thông báo ở đây */
              }}
            />
          </div>
        ) : (
          // 🟢 FORM LOGIN / FORGOT CŨ (GIỮ NGUYÊN)
          <form
            onSubmit={mode === "login" ? handleLogin : handleForgotPassword}
            className="w-full px-6 flex flex-col items-center justify-center relative z-10"
          >
            <div className="w-full max-w-[500px] flex flex-col gap-5 md:gap-6">
              {/* Mode Title với Back button */}
              <div
                className={`flex items-center justify-center mb-2 ${
                  isError ? "animate-shake" : ""
                }`}
              >
                {mode === "forgotPassword" && (
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="absolute left-6 md:left-auto md:relative md:mr-4 text-white/50 hover:text-white transition-colors p-2"
                  >
                    <ArrowLeft size={24} />
                  </button>
                )}
                <h1 className="text-2xl md:text-3xl font-bold tracking-[0.3em] text-white/80">
                  {mode === "forgotPassword" ? "QUÊN MẬT KHẨU" : "LOGIN"}
                </h1>
              </div>

              {/* Input Group */}
              <div
                className={`flex flex-col gap-4 ${
                  isError ? "animate-shake" : ""
                }`}
              >
                <ONhapLieu
                  id="inp_email"
                  label="EMAIL"
                  value={user.name}
                  onChange={(v: string) => setUser((p) => ({ ...p, name: v }))}
                />

                {mode === "login" && (
                  <ONhapLieu
                    id="inp_password"
                    label="MẬT KHẨU"
                    value={user.phone}
                    onChange={(v: string) =>
                      setUser((p) => ({ ...p, phone: v }))
                    }
                    type={showPhone ? "text" : "password"}
                    showEye={true}
                    isPasswordVisible={showPhone}
                    onToggleEye={() => setShowPhone(!showPhone)}
                  />
                )}

                {/* Options Checkbox */}
                {mode === "login" && (
                  <div className="flex flex-row items-center justify-between px-1 mt-1">
                    <div
                      className="flex items-center gap-2 cursor-pointer group select-none"
                      onClick={() => setRememberMe(!rememberMe)}
                    >
                      <div
                        className={`transition-colors ${
                          rememberMe
                            ? "text-[#C69C6D]"
                            : "text-gray-600 group-hover:text-gray-400"
                        }`}
                      >
                        {rememberMe ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </div>
                      <span
                        className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${
                          rememberMe
                            ? "text-white"
                            : "text-gray-500 group-hover:text-gray-400"
                        }`}
                      >
                        GHI NHỚ ĐĂNG NHẬP
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-2 cursor-pointer group select-none"
                      onClick={() => setWantFullScreen(!wantFullScreen)}
                    >
                      <div
                        className={`transition-colors ${
                          wantFullScreen
                            ? "text-yellow-500"
                            : "text-gray-600 group-hover:text-gray-400"
                        }`}
                      >
                        {wantFullScreen ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </div>
                      <span
                        className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${
                          wantFullScreen
                            ? "text-white"
                            : "text-gray-500 group-hover:text-gray-400"
                        }`}
                      >
                        Toàn màn hình
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full max-w-[500px] mt-6 flex justify-center">
              <NutXacNhan isLoading={flags.loading} mode={mode} />
            </div>

            {/* Footer Links */}
            <div className="mt-6 flex flex-col items-center gap-3">
              {mode === "login" && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode("forgotPassword")}
                    className="inline-flex items-center gap-2 text-xs md:text-sm text-white/40 hover:text-[#C69C6D] transition-all duration-300"
                  >
                    <KeyRound size={14} /> <span>Quên mật khẩu?</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="inline-flex items-center gap-2 text-xs md:text-sm text-white/40 hover:text-[#C69C6D] transition-all duration-300"
                  >
                    <UserPlus size={14} />{" "}
                    <span>Chưa có tài khoản? Đăng ký ngay</span>
                  </button>
                </>
              )}

              {mode === "forgotPassword" && (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="inline-flex items-center gap-2 text-xs md:text-sm text-white/40 hover:text-[#C69C6D] transition-all duration-300"
                >
                  <span>Quay lại đăng nhập</span>
                </button>
              )}

              <a
                href="tel:+84939941588"
                className="inline-flex items-center gap-2 text-xs md:text-sm text-white/30 hover:text-white transition-all duration-300 border-b border-transparent hover:border-white/50 pb-0.5 group"
              >
                <Lock
                  size={12}
                  className="group-hover:text-green-400 transition-colors"
                />{" "}
                <span>Cần hỗ trợ?</span>
              </a>
            </div>
          </form>
        )}
      </div>

      {/* Error Dialog */}
      {showErrorDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          style={{ zIndex: Z_INDEX.modal + 10 }}
          onClick={() => setShowErrorDialog(false)}
        >
          <div
            className="relative bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-2xl p-8 max-w-sm w-[90%] shadow-2xl transform animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Đăng nhập thất bại
            </h3>
            <p className="text-white/60 text-sm text-center mb-6">
              {errorMessage || "Vui lòng kiểm tra lại thông tin"}
            </p>
            <button
              onClick={() => setShowErrorDialog(false)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/10 hover:border-white/30"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          style={{ zIndex: Z_INDEX.modal + 10 }}
          onClick={() => setShowSuccessDialog(false)}
        >
          <div
            className="relative bg-gradient-to-b from-emerald-900/30 to-black border border-emerald-500/30 rounded-2xl p-8 max-w-sm w-[90%] shadow-2xl transform animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                <Lock className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Thành công!
            </h3>
            <p className="text-white/60 text-sm text-center mb-6">
              {successMessage}
            </p>
            <button
              onClick={() => setShowSuccessDialog(false)}
              className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold rounded-xl transition-all duration-300 border border-green-500/30 hover:border-green-500/50"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

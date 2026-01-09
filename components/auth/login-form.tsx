"use client";

import React, { useState, useActionState } from "react"; // Hook React 19
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth"; // Logic Server Action mới
import { supabase } from '@/utils/supabase/client';
import { 
  UserPlus, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock 
} from "lucide-react";
import ChanForm from "@/components/ChanForm"; // Giả sử bạn để ChanForm ở đây, hoặc sửa đường dẫn cho đúng

// --- A. COMPONENT HIỆU ỨNG NỀN (Giữ nguyên từ code cũ) ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

const NenHieuUng = () => {
  return (
    <div className="absolute inset-0 bg-[#050505] overflow-hidden z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-transparent z-10" />
      {/* Giữ lại ảnh nền desktop làm mặc định để đơn giản hóa */}
      <img
        src={`${BASE_IMG_URL}/login-desktop.jpg`}
        alt="Background"
        className="w-full h-full object-cover opacity-40 animate-in fade-in duration-1000"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,100,0.03),transparent_70%)]" />
    </div>
  );
};

// --- B. FORM CHÍNH (Giao diện Cũ + Logic Mới) ---
export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  
  // 1. LOGIC MỚI: Dùng useActionState thay vì useState cho form data
  const [state, formAction, isPending] = useActionState(login, null);
  
  // State hiển thị mật khẩu (UI thuần túy)
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Lớp nền */}
      <NenHieuUng />

      {/* Container chính */}
      <div className="relative z-20 w-full max-w-[420px] px-6">
        
        {/* Logo / Header */}
        <div className="mb-8 text-center animate-in slide-in-from-bottom-5 fade-in duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-[0_0_30px_-5px_rgba(0,255,100,0.1)] backdrop-blur-md">
            <Lock className="w-8 h-8 text-white/80" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            CỔNG ĐĂNG NHẬP
          </h1>
          <p className="text-white/40 text-sm mt-2 font-medium tracking-wide uppercase">
            Hệ thống quản trị tập trung
          </p>
        </div>

        {/* --- FORM BẮT ĐẦU --- */}
        {/* Thay onSubmit cũ bằng action={formAction} */}
        <form action={formAction} className="space-y-5 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-150">
          
          {/* Input ẩn lưu đường dẫn return */}
          <input type="hidden" name="next" value={next} />

          {/* Hiển thị lỗi từ Server (Nếu có) - Style theo giao diện cũ */}
          {state?.error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm animate-shake">
              <p className="text-red-400 text-sm text-center font-medium flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {state.error}
              </p>
            </div>
          )}

          {/* 1. EMAIL */}
          <div className="group relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <UserPlus className="h-5 w-5 text-white/30 group-focus-within:text-green-400 transition-colors duration-300" />
            </div>
            <input
              name="email"      // QUAN TRỌNG: Để Server đọc được
              type="email"
              required
              placeholder="Tên đăng nhập / Email"
              className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 focus:bg-white/10 transition-all duration-300 sm:text-sm shadow-inner"
            />
            {/* Lỗi Validation chi tiết (nếu có) */}
            {state?.validationErrors?.email && (
               <p className="text-red-400 text-xs mt-1 ml-1">{state.validationErrors.email[0]}</p>
            )}
          </div>

          {/* 2. PASSWORD */}
          <div className="group relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <KeyRound className="h-5 w-5 text-white/30 group-focus-within:text-green-400 transition-colors duration-300" />
            </div>
            <input
              name="password"   // QUAN TRỌNG: Để Server đọc được
              type={showPassword ? "text" : "password"}
              required
              placeholder="Mật khẩu truy cập"
              className="block w-full pl-11 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 focus:bg-white/10 transition-all duration-300 sm:text-sm shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-white/30 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
            {state?.validationErrors?.password && (
               <p className="text-red-400 text-xs mt-1 ml-1">{state.validationErrors.password[0]}</p>
            )}

          {/* 3. NÚT SUBMIT */}
          <button
            type="submit"
            disabled={isPending} // Dùng trạng thái pending của Server Action
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-sm font-bold text-black bg-white hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(74,222,128,0.6)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                ĐANG XÁC THỰC...
              </span>
            ) : (
              "XÁC NHẬN DANH TÍNH"
            )}
          </button>
        </form>

        {/* Google login removed */}

        {/* 5. FOOTER (ChanForm) */}
        <ChanForm />
      </div>
    </div>
  );
}
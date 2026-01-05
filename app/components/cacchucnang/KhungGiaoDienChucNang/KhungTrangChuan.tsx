"use client";

import React, { ReactNode } from "react";
import MenuTren from "@/app/GiaoDienTong/MenuTren/MenuTren";

import { Z_INDEX } from "@/app/constants/zIndex";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

// 🟢 UPDATE: Export interface và đổi tên cho chuẩn
export interface KhungTrangChuanProps {
  children: ReactNode;
  nguoiDung: any;
  loiChao?: string;
  contentClassName?: string;
}

export default function KhungTrangChuan({
  children,
  nguoiDung,
  loiChao,
  contentClassName = "max-w-[1920px] mx-auto p-3 pb-24 md:p-6 md:pb-24 pt-24",
}: KhungTrangChuanProps) {
  const bgUrlMobile = `${BASE_IMG_URL}/trangchu-mobile.jpg`;
  const bgUrlTablet = `${BASE_IMG_URL}/trangchu-tablet.jpg`;
  const bgUrlDesktop = `${BASE_IMG_URL}/trangchu-desktop.jpg`;

  const displayLoiChao = loiChao || `Xin chào, ${nguoiDung?.ho_ten || "User"}`;

  return (
    <div
      // 🟢 FIX 10/10: Bỏ text-[14px], dùng text-base (mobile) và text-sm (desktop)
      className="relative w-full min-h-[100dvh] bg-[#050505] text-[#F5F5F5] font-sans overflow-x-hidden selection:bg-[#C69C6D] selection:text-black text-base md:text-sm"
    >
      {/* LAYER 0: HÌNH NỀN CHUẨN */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none bg-black">
        <img
          src={bgUrlMobile}
          alt="BG"
          className="absolute inset-0 w-full h-full object-cover md:hidden opacity-100"
        />
        <img
          src={bgUrlTablet}
          alt="BG"
          className="absolute inset-0 w-full h-full object-cover hidden md:block lg:hidden opacity-100"
        />
        <img
          src={bgUrlDesktop}
          alt="BG"
          className="absolute inset-0 w-full h-full object-cover hidden lg:block opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
      </div>

      {/* LAYER 1: NỘI DUNG CHÍNH */}
      <main
        className={`relative z-[10] w-full min-h-[100dvh] flex flex-col ${contentClassName}`}
      >
        {children}
      </main>

      {/* LAYER 2: GRADIENT BẢO VỆ MENU */}
      <div className="fixed top-0 left-0 right-0 h-28 bg-gradient-to-b from-black to-transparent z-[4900] pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black to-transparent z-[4900] pointer-events-none"></div>

      {/* LAYER 3: HỆ THỐNG MENU */}
      <MenuTren nguoiDung={nguoiDung} loiChao={displayLoiChao} />
    </div>
  );
}
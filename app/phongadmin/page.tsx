/**
 * ============================================================
 * PHÒNG ADMIN - COMMAND CENTER
 * ============================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import {
  Users,
  BookUser,
  LayoutDashboard,
  Palette, // 🟢 THÊM: Icon cho thiết kế
} from "lucide-react";
import KhungTrangChuan from "@/app/components/cacchucnang/KhungGiaoDienChucNang/KhungTrangChuan";
import ThanhPhongChucNang from "@/components/ThanhPhongChucNang";

// Import chức năng từ thư viện
import { NhanSuChucNang } from "@/app/components/cacchucnang";
import { KhachHangChucNang } from "@/app/components/cacchucnang/khachhang";
// 🟢 THÊM: Import chức năng Mẫu Thiết Kế
import { MauThietKeChucNang } from "@/app/components/cacchucnang/mauthietke";

// ============================================================
// QUYỀN HẠN PHÒNG ADMIN - FULL ACCESS
// ============================================================

const ADMIN_PERMISSIONS = {
  nhansu: {
    allowView: true,
    allowEdit: true,
    allowDelete: true,
    allowBulk: true,
  },
  khachhang: {
    allowView: true,
    allowEdit: true,
    allowDelete: true,
    allowBulk: true,
  },
  // 🟢 THÊM: Cấu hình quyền cho Mẫu thiết kế
  mauthietke: {
    allowView: true,
    allowEdit: true,
    allowDelete: true,
    allowBulk: true,
  },
};

// ============================================================
// DANH SÁCH CHỨC NĂNG (MENU)
// ============================================================

const ADMIN_FUNCTIONS = [
  // Dashboard Tổng quan
  { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  
  // Quản lý người dùng
  { id: "nhansu", label: "NHÂN SỰ", icon: Users },
  { id: "khachhang", label: "KHÁCH HÀNG", icon: BookUser },
  
  // 🟢 THÊM: Mục menu Mẫu thiết kế
  { id: "mauthietke", label: "KHO THIẾT KẾ", icon: Palette },
];

// ============================================================
// COMPONENT CHÍNH
// ============================================================

export default function PhongAdminPage() {
  const { user: contextUser, loading: contextLoading } = useUser();
  const [authLoading, setAuthLoading] = useState(true);
  const [activeFunction, setActiveFunction] = useState<string>("dashboard");

  useEffect(() => {
    if (!contextLoading) setAuthLoading(false);
  }, [contextLoading]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback: Lấy user từ localStorage nếu context chưa kịp load
  let displayUser = contextUser;
  if (!displayUser && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("USER_INFO");
      displayUser = stored ? JSON.parse(stored) : null;
    } catch (e) {
      displayUser = null;
    }
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <KhungTrangChuan
      nguoiDung={displayUser}
      loiChao="ADMIN COMMAND CENTER"
      contentClassName="flex flex-col h-[100dvh] pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]"
    >
      {/* Thanh Phòng + Chức Năng (Menu ngang dưới cùng hoặc trên) */}
      <ThanhPhongChucNang
        tenPhong="PHÒNG ADMIN"
        functions={ADMIN_FUNCTIONS}
        activeFunction={activeFunction}
        onFunctionChange={setActiveFunction}
      />

      {/* Content Area */}
      <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

        <div className="absolute inset-0 z-10">
          <div className="w-full h-full flex flex-col relative">
            
            {/* ====== RENDER CÁC CHỨC NĂNG ====== */}

            {/* 1. Dashboard (Mặc định) */}
            {activeFunction === "dashboard" && <DashboardPlaceholder />}

            {/* 2. Nhân sự */}
            {activeFunction === "nhansu" && (
              <NhanSuChucNang permissions={ADMIN_PERMISSIONS.nhansu} />
            )}

            {/* 3. Khách hàng */}
            {activeFunction === "khachhang" && (
              <KhachHangChucNang permissions={ADMIN_PERMISSIONS.khachhang} />
            )}

            {/* 4. 🟢 THÊM: Mẫu thiết kế */}
            {activeFunction === "mauthietke" && (
              <MauThietKeChucNang permissions={ADMIN_PERMISSIONS.mauthietke} />
            )}
            
          </div>
        </div>
      </div>
    </KhungTrangChuan>
  );
}

// ============================================================
// COMPONENTS PHỤ
// ============================================================

function DashboardPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-white/30 animate-in fade-in duration-500">
      <LayoutDashboard size={64} className="mb-4 opacity-30 text-[#C69C6D]" />
      <p className="font-bold uppercase tracking-widest text-lg text-[#C69C6D]/50">Dashboard Tổng Quan</p>
      <p className="text-sm mt-2 font-mono">System Status: Online</p>
    </div>
  );
}
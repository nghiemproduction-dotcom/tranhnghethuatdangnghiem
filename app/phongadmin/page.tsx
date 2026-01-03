/**
 * ============================================================
 * PHÒNG ADMIN - COMMAND CENTER
 * ============================================================
 * * File page duy nhất của phòng admin.
 * Gọi các chức năng từ cacchucnang với quyền FULL.
 * * QUYỀN HẠN PHÒNG ADMIN:
 * - allowView: ✅ Xem tất cả
 * - allowEdit: ✅ Sửa tất cả
 * - allowDelete: ✅ Xóa tất cả
 * - allowBulk: ✅ Thao tác hàng loạt
 * * CÁC CHỨC NĂNG:
 * - Tổng quan Dashboard
 * - Nhân sự (full quyền)
 * - Khách hàng (full quyền)
 * - Mẫu thiết kế (full quyền)
 * - Data Center (admin only)
 * - Cài đặt hệ thống (admin only)
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/ThuVien/UserContext";
import {
  Users,
  BookUser,
  LayoutDashboard,
  Database,
  Settings,
  Palette,
} from "lucide-react";
import KhungTrangChuan from "@/app/components/KhungTrangChuan";
import ThanhPhongChucNang from "@/app/components/ThanhPhongChucNang";

// Import chức năng từ cacchucnang
import { NhanSuChucNang } from "@/app/components/cacchucnang";
import { KhachHangChucNang } from "@/app/components/cacchucnang/khachhang";
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
  mauthietke: {
    allowView: true,
    allowEdit: true,
    allowDelete: true,
    allowBulk: true,
  },
  // Thêm quyền cho các chức năng khác...
};

// ============================================================
// DANH SÁCH CHỨC NĂNG
// ============================================================

const ADMIN_FUNCTIONS = [
  // Quản lý người dùng
  { id: "nhansu", label: "NHÂN SỰ", icon: Users },
  { id: "khachhang", label: "KHÁCH HÀNG", icon: BookUser },
  // Quản lý thiết kế
  { id: "mauthietke", label: "MẪU THIẾT KẾ", icon: Palette },
  // Admin only
];

// ============================================================
// COMPONENT CHÍNH
// ============================================================

export default function PhongAdminPage() {
  const { user: contextUser, loading: contextLoading } = useUser();
  const router = useRouter();
  const [activeFunction, setActiveFunction] = useState<string>("nhansu"); // Mặc định vào Nhân sự cho dễ thấy

  // 🛡️ BẢO MẬT: Chặn truy cập trái phép ngay từ Client
  useEffect(() => {
    if (!contextLoading) {
      // 1. Nếu chưa đăng nhập -> Cút về home
      if (!contextUser) {
        console.warn(
          "⛔ Unauthorized access to Admin Panel - Redirecting to Home"
        );
        router.replace("/");
        return;
      }

      // 2. Nếu đã đăng nhập nhưng không phải Admin/Boss -> Cũng cút
      const role = contextUser.vi_tri_normalized || "";
      const isAdmin = ["admin", "boss"].includes(role.toLowerCase());

      if (!isAdmin) {
        console.warn(
          `⛔ Forbidden access attempt by ${contextUser.email} (Role: ${role})`
        );
        router.replace("/trangchu");
      }
    }
  }, [contextLoading, contextUser, router]);

  // Loading state (Chờ check auth xong mới render)
  if (contextLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Double check trước khi render (để tránh flash content)
  const role = contextUser?.vi_tri_normalized || "";
  const isAdmin = ["admin", "boss"].includes(role.toLowerCase());

  if (!contextUser || !isAdmin) {
    return null; // Render nothing while redirecting
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <KhungTrangChuan
      nguoiDung={contextUser} // Dùng trực tiếp contextUser, không fallback localStorage
      loiChao="ADMIN COMMAND CENTER"
      contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]"
    >
      {/* Thanh Phòng + Chức Năng */}
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

            {/* Nhân sự - GỌI TỪ CACCHUCNANG với quyền ADMIN */}
            {activeFunction === "nhansu" && (
              <NhanSuChucNang permissions={ADMIN_PERMISSIONS.nhansu} />
            )}

            {/* Khách hàng - GỌI TỪ CACCHUCNANG với quyền ADMIN */}
            {activeFunction === "khachhang" && (
              <KhachHangChucNang permissions={ADMIN_PERMISSIONS.khachhang} />
            )}

            {/* Mẫu thiết kế - GỌI TỪ CACCHUCNANG với quyền ADMIN */}
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

function PlaceholderScreen({ text }: { text: string }) {
  return (
    <div className="h-full flex items-center justify-center text-white/30 font-bold uppercase">
      {text}
    </div>
  );
}

function DashboardPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-white/30">
      <LayoutDashboard size={64} className="mb-4 opacity-30" />
      <p className="font-bold uppercase">Dashboard Tổng Quan</p>
      <p className="text-sm mt-2">Đang phát triển...</p>
    </div>
  );
}

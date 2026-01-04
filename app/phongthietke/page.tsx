"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import Router để chuyển trang
import { useUser } from "@/app/ThuVien/UserContext";
import KhungTrangChuan from "@/app/components/cacchucnang/KhungGiaoDienChucNang/KhungTrangChuan";
import ThanhPhongChucNang from "@/app/components/ThanhPhongChucNang";
import { Palette } from "lucide-react";

// Import chức năng Mẫu Thiết Kế
import MauThietKeChucNang from "@/app/components/cacchucnang/mauthietke/MauThietKeChucNang";

// ============================================================
// CẤU HÌNH QUYỀN HẠN PHÒNG THIẾT KẾ
// ============================================================
const THIETKE_PERMISSIONS = {
  allowView: true,
  allowEdit: true,
  allowDelete: false, // Không được xóa
  allowBulk: false,
};

const THIETKE_FUNCTIONS = [
  { id: "mauthietke", label: "KHO THIẾT KẾ", icon: Palette },
];

// ============================================================
// COMPONENT CHÍNH
// ============================================================

export default function PhongThietKe() {
  const router = useRouter(); // Khởi tạo router
  const { user: contextUser, loading: contextLoading } = useUser();
  const [authLoading, setAuthLoading] = useState(true);

  // Mặc định vào thẳng Mẫu thiết kế
  const [activeFunction, setActiveFunction] = useState<string>("mauthietke");

  // 🟢 LOGIC KIỂM TRA ĐĂNG NHẬP
  useEffect(() => {
    // Chỉ chạy khi Context đã load xong
    if (!contextLoading) {
      // Kiểm tra user trong Context hoặc LocalStorage (đề phòng reload trang)
      let currentUser = contextUser;
      if (!currentUser && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("USER_INFO");
          currentUser = stored ? JSON.parse(stored) : null;
        } catch {}
      }

      // Nếu vẫn không có user -> Đá về TRANG CHỦ
      if (!currentUser) {
        router.push("/trangchu");
      } else {
        // Đã đăng nhập -> Tắt màn hình loading
        setAuthLoading(false);
      }
    }
  }, [contextLoading, contextUser, router]);

  // Màn hình chờ trong lúc kiểm tra (Loading Screen)
  if (authLoading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#C69C6D] text-xs font-bold animate-pulse uppercase">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  // Get User info fallback (để hiển thị lên Header)
  let displayUser = contextUser;
  if (!displayUser && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("USER_INFO");
      displayUser = stored ? JSON.parse(stored) : null;
    } catch {
      displayUser = null;
    }
  }

  return (
    <KhungTrangChuan
      nguoiDung={displayUser}
      loiChao="PHÒNG THIẾT KẾ"
      contentClassName="flex flex-col h-[100dvh] pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]"
    >
      {/* Thanh Chức Năng */}
      <ThanhPhongChucNang
        tenPhong="PHÒNG THIẾT KẾ"
        functions={THIETKE_FUNCTIONS}
        activeFunction={activeFunction}
        onFunctionChange={setActiveFunction}
      />

      {/* Vùng Nội Dung Chính */}
      <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

        <div className="absolute inset-0 z-10">
          <div className="w-full h-full flex flex-col relative">
            {activeFunction === "mauthietke" && (
              <MauThietKeChucNang permissions={THIETKE_PERMISSIONS} />
            )}
          </div>
        </div>
      </div>
    </KhungTrangChuan>
  );
}

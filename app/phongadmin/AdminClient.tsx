"use client";

import React, { useState } from "react";
import { Users, BookUser, LayoutDashboard, Palette, ClipboardList } from "lucide-react";
import KhungTrangChuan from "@/app/components/cacchucnang/KhungGiaoDienChucNang/KhungTrangChuan";
import ThanhPhongChucNang from "@/components/ThanhPhongChucNang";

// Import các chức năng
import { NhanSuChucNang } from "@/app/components/cacchucnang/nhansu"; 
import KhachHangChucNang from "@/app/components/cacchucnang/khachhang/KhachHangChucNang";
import MauThietKeChucNang from "@/app/components/cacchucnang/mauthietke/MauThietKeChucNang";
 

// 🟢 FIX LỖI IMPORT TẠI ĐÂY:
// Thay vì lấy từ "dal/admin", hãy lấy từ "dtos"
import type { 
  AdminUserDTO, 
  DashboardStatsDTO,
  MauThietKeDTO, 
  ViecMauDTO 
} from "@/lib/dtos";

// Import Type cũ (giữ nguyên nếu hệ thống cũ còn dùng)
import type { NhanSu } from "@/app/components/cacchucnang/nhansu/config";
import type { KhachHang } from "@/app/components/cacchucnang/khachhang/config";


// ============================================================
// CẤU HÌNH ADMIN
// ============================================================

const ADMIN_PERMISSIONS = {
  nhansu: { allowView: true, allowEdit: true, allowDelete: true, allowBulk: true },
  khachhang: { allowView: true, allowEdit: true, allowDelete: true, allowBulk: true },
  mauthietke: { allowView: true, allowEdit: true, allowDelete: true, allowBulk: true },
  viecmau: { allowView: true, allowEdit: true, allowDelete: true, allowBulk: true },
};

const ADMIN_FUNCTIONS = [
  { id: "dashboard", label: "TỔNG QUAN", icon: LayoutDashboard },
  { id: "nhansu", label: "NHÂN SỰ", icon: Users },
  { id: "khachhang", label: "KHÁCH HÀNG", icon: BookUser },
  { id: "mauthietke", label: "MẪU THIẾT KẾ", icon: Palette },
  { id: "viecmau", label: "VIỆC MẪU", icon: ClipboardList },
];

// ============================================================
// CLIENT COMPONENT
// ============================================================

interface Props {
  user: AdminUserDTO;
  stats: DashboardStatsDTO;
  initialNhanSu?: NhanSu[]; 
  initialKhachHang?: KhachHang[];
  initialMauThietKe?: MauThietKeDTO[];
  initialViecMau?: ViecMauDTO[];
}

export default function AdminClient({ 
  user, 
  stats, 
  initialNhanSu = [], 
  initialKhachHang = [],
  initialMauThietKe = [],
  initialViecMau = []
}: Props) {
  
  const [activeFunction, setActiveFunction] = useState<string>("dashboard");

  return (
    <KhungTrangChuan
      nguoiDung={{
        ...user,
        ho_ten: user.fullName, // Map lại field cho đúng với UI
        avatar_url: user.avatar
      }}
      loiChao="QUẢN TRỊ VIÊN"
      contentClassName="flex flex-col h-[100dvh] pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]"
    >
      {/* Thanh Chức Năng */}
      <ThanhPhongChucNang
        tenPhong="ADMIN CONTROL"
        functions={ADMIN_FUNCTIONS}
        activeFunction={activeFunction}
        onFunctionChange={setActiveFunction}
      />

      {/* Vùng Nội Dung Chính */}
      <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

        <div className="absolute inset-0 z-10 overflow-y-auto custom-scrollbar">
          
          {/* DASHBOARD */}
          {activeFunction === "dashboard" && (
            <DashboardView stats={stats} />
          )}

          {/* NHÂN SỰ */}
          {activeFunction === "nhansu" && (
            <NhanSuChucNang 
              permissions={ADMIN_PERMISSIONS.nhansu} 
              
            />
          )}

          {/* KHÁCH HÀNG */}
          {activeFunction === "khachhang" && (
            <KhachHangChucNang 
              permissions={ADMIN_PERMISSIONS.khachhang} 
            
            />
          )}

          {/* MẪU THIẾT KẾ */}
          {activeFunction === "mauthietke" && (
            <MauThietKeChucNang 
              permissions={ADMIN_PERMISSIONS.mauthietke} 
            
              className="h-full"
            />
          )}

       

        </div>
      </div>
    </KhungTrangChuan>
  );
}

// Component Dashboard
function DashboardView({ stats }: { stats: DashboardStatsDTO }) {
  // Fallback nếu stats null
  const s = stats || { countNhanSu: 0, countKhachHang: 0, countMauThietKe: 0, countViecMau: 0 };

  return (
    <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      <StatCard label="NHÂN SỰ" value={s.countNhanSu} icon={<Users />} color="text-blue-500" />
      <StatCard label="KHÁCH HÀNG" value={s.countKhachHang} icon={<BookUser />} color="text-green-500" />
      <StatCard label="MẪU THIẾT KẾ" value={s.countMauThietKe} icon={<Palette />} color="text-purple-500" />
      <StatCard label="QUY TRÌNH MẪU" value={s.countViecMau} icon={<ClipboardList />} color="text-orange-500" />
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-white/30 transition-all">
      <div className={`p-4 rounded-full bg-white/5 ${color}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
      </div>
      <div className="text-center">
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-xs text-white/50 font-bold uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
'use client';
import React from 'react';
import DashboardBuilder from '@/app/GiaoDienTong/DashboardBuilder/DashboardBuilder';
// 🟢 Đã xóa import ThanhDieuHuong
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';

interface Props { isOpen: boolean; onClose: () => void; }

export default function ModalPhongQuanLy({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    // 🟢 SỬA GIAO DIỆN:
    // 1. Thay bg-[#0a0807] thành bg-black/90 backdrop-blur-xl (Hiệu ứng kính đen mờ)
    // 2. Xóa phần div chứa ThanhDieuHuong
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[2100] bg-black/90 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
        
        {/* 🟢 Nội dung chính (Đã được NoidungModal padding-top để tránh MenuTren) */}
        <NoidungModal>
             <div className="w-full h-full pb-4"> 
                <DashboardBuilder 
                    pageId="quanly" 
                    title="Quản Lý Tổng Hợp" 
                    allowedRoles={['admin', 'quanly', 'boss']} 
                    hideAddButton={false} 
                />
             </div>
        </NoidungModal>
    </div>
  );
}
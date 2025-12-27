'use client';
import React from 'react';
import DashboardBuilder from '@/app/GiaoDienTong/DashboardBuilder/DashboardBuilder';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';

interface Props { isOpen: boolean; onClose: () => void; }

export default function ModalPhongQuanLy({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    // 🟢 SỬA CHUẨN: BỎ HOÀN TOÀN CÁC THẺ DIV BAO QUANH
    // Chỉ dùng NoidungModal để quản lý hiển thị -> Đảm bảo trong suốt
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
  );
}
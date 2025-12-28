'use client';
import React from 'react';
import DashboardBuilder from '@/app/GiaoDienTong/DashboardBuilder/DashboardBuilder';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';

interface Props { isOpen: boolean; onClose: () => void; }

export default function ModalPhongQuanLy({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    // Sử dụng NoidungModal (đã được fix z-index 2500 và full màn hình ở trên)
    <NoidungModal>
         <div className="w-full h-full"> 
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
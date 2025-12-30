'use client';
import React from 'react';
import DashboardBuilder from '@/app/GiaoDienTong/DashboardBuilder/DashboardBuilder';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';

interface Props { isOpen: boolean; onClose: () => void; }

export default function ModalPhongTrungBay({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <NoidungModal>
         <div className="w-full h-full relative"> 
            {/* Nút đóng */}
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 z-[6000] p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Đóng"
            >
                ✕
            </button>

            <DashboardBuilder 
                pageId="trungbay" // ID riêng biệt để lưu cấu hình
                title="Không Gian Trưng Bày & Triển Lãm" 
                allowedRoles={['admin', 'quanly', 'boss', 'thietke', 'sales']} 
                hideAddButton={false} // Cho phép thêm module
            />
         </div>
    </NoidungModal>
  );
}
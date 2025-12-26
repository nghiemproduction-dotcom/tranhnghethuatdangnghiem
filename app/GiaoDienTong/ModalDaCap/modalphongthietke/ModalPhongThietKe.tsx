'use client';
import React from 'react';
import DashboardBuilder from '@/app/GiaoDienTong/DashboardBuilder/DashboardBuilder';
import ThanhDieuHuong from '../GiaoDien/ThanhDieuHuong';
import NoidungModal from '../GiaoDien/NoidungModal';

interface Props { 
  isOpen: boolean; 
  onClose: () => void; 
}

export default function ModalPhongThietKe({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-[clamp(65px,16vw,85px)] z-[2100] bg-[#0a0807] flex flex-col animate-in fade-in duration-200 border-b border-[#8B5E3C]/30 shadow-2xl">
        
        {/* Header Điều Hướng */}
        <div className="shrink-0 z-50 bg-[#0a0807]/80 backdrop-blur-xl border-b border-[#8B5E3C]/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <ThanhDieuHuong danhSachCap={[
                    { id: 'home', ten: 'Trang Chủ', onClick: onClose }, 
                    { id: 'phongban', ten: 'Phòng Ban', onClick: onClose },
                    { id: 'thietke', ten: 'PHÒNG THIẾT KẾ' } // 🟢 Tên phòng mới
                ]} 
            />
        </div>

        <NoidungModal>
             <div className="w-full h-full pb-4"> 
                {/* 🟢 QUAN TRỌNG: pageId="thietke" sẽ tạo ra một kho lưu trữ cấu hình hoàn toàn mới */}
                <DashboardBuilder 
                    pageId="thietke" 
                    title="Quản Lý Thiết Kế & Mẫu" 
                    allowedRoles={['admin', 'boss', 'thietke', 'designer']} // 🟢 Phân quyền riêng cho Designer
                    hideAddButton={false} 
                />
             </div>
        </NoidungModal>
    </div>
  );
}
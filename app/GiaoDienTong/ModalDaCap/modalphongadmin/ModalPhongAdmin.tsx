'use client';
import React from 'react';
import DashboardBuilder from '@/app/GiaoDienTong/DashboardBuilder/DashboardBuilder';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

import ThanhDieuHuong from '../GiaoDien/ThanhDieuHuong';
import NoidungModal from '../GiaoDien/NoidungModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalPhongQuanLy({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const configModule: ModuleConfig = {
      id: 'module_quanly_main',
      tenModule: 'Quản Lý Tổng Hợp',
      moduleType: 'custom',      
      customId: 'custom_quanly',
      bangDuLieu: 'nhan_su',
      doRong: 1,                 
      rowHeight: 300,            
      rowId: 'row_top',          
      version: '1.0',
      updatedAt: new Date().toISOString(),
      danhSachCot: [],           
      page_id: 'quanly'
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-[clamp(65px,16vw,85px)] z-[2100] bg-[#0a0807] flex flex-col animate-in fade-in duration-200 border-b border-[#8B5E3C]/30 shadow-2xl">
        
        {/* 🟢 KHAI BÁO 3 CẤP ĐỂ ĐẢM BẢO LUÔN CÓ TRANG CHỦ & TIÊU ĐỀ */}
        <ThanhDieuHuong 
            danhSachCap={[
                { id: 'home', ten: 'Trang Chủ', onClick: onClose }, // Cấp 1
                { id: 'phongban', ten: 'Phòng Ban', onClick: onClose }, // Cấp 2
                { id: 'quanly', ten: 'PHÒNG QUẢN LÝ' } // Cấp 3 -> Tự động biến thành Tiêu Đề
            ]} 
        />

        {/* Đã xóa ThanhTieuDe */}

        <NoidungModal>
             <div className="w-full h-full pb-4"> 
                <DashboardBuilder 
                    pageId="quanly" 
                    title="" 
                    allowedRoles={['admin', 'quanly', 'boss']}
                    initialModules={[configModule]} 
                    hideAddButton={false} 
                />
             </div>
        </NoidungModal>
    </div>
  );
}
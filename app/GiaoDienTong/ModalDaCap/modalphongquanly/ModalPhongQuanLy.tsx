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

  // 🟢 CẤU HÌNH MODULE NHÂN SỰ
  const configModule: ModuleConfig = {
      id: 'module_quanly_nhansu', // ID duy nhất
      tenModule: 'Quản Lý Nhân Sự', // Tên hiển thị trên thanh header của module
      moduleType: 'custom',      
      customId: 'custom_nhan_su',
      bangDuLieu: 'nhan_su', // 🟢 Quan trọng: Load dữ liệu từ bảng nhan_su
      doRong: 2, // Độ rộng 2 (Full width) để hiển thị danh sách nhân sự cho thoáng
      rowHeight: 500, // Chiều cao thoải mái
      rowId: 'row_nhansu_main',          
      version: '1.0',
      updatedAt: new Date().toISOString(),
      danhSachCot: [], // Để trống, vào phần Cấu hình cột (bánh răng) để chọn cột sau
      page_id: 'quanly'
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-[clamp(65px,16vw,85px)] z-[2100] bg-[#0a0807] flex flex-col animate-in fade-in duration-200 border-b border-[#8B5E3C]/30 shadow-2xl">
        
        {/* Header: Thanh điều hướng kiêm Tiêu đề */}
        <div className="shrink-0 z-50 bg-[#0a0807]/80 backdrop-blur-xl border-b border-[#8B5E3C]/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <ThanhDieuHuong 
                danhSachCap={[
                    { id: 'home', ten: 'Trang Chủ', onClick: onClose }, 
                    { id: 'phongban', ten: 'Phòng Ban', onClick: onClose },
                    { id: 'quanly', ten: 'PHÒNG QUẢN LÝ' } // Tiêu đề lớn
                ]} 
            />
        </div>

        <NoidungModal>
             <div className="w-full h-full pb-4"> 
                <DashboardBuilder 
                    pageId="quanly" 
                    title="Quản Lý Tổng Hợp" 
                    allowedRoles={['admin', 'quanly', 'boss', 'hr']} // Thêm 'hr' nếu có
                    initialModules={[configModule]} 
                    hideAddButton={false} // Cho phép quản lý thêm module khác nếu cần
                />
             </div>
        </NoidungModal>
    </div>
  );
}
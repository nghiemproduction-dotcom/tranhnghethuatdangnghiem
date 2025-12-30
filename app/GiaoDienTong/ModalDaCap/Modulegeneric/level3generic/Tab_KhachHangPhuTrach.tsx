'use client';
import React from 'react';
import type { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
 
// 🟢 CẤU HÌNH CHO BẢNG KHÁCH HÀNG NHÚNG
const CONFIG_KHACH_HANG_EMBED: ModuleConfig = {
    id: 'khach_hang_embed',
    tenModule: 'Danh sách khách hàng',
    bangDuLieu: 'khach_hang',
    danhSachCot: [
        { key: 'ho_ten', label: 'Tên Khách', kieuDuLieu: 'text', hienThiList: true, batBuoc: false, tuDong: false, hienThiDetail: true },
        { key: 'so_dien_thoai', label: 'SĐT', kieuDuLieu: 'text', hienThiList: true, batBuoc: false, tuDong: false, hienThiDetail: true },
        { key: 'trang_thai', label: 'Trạng Thái', kieuDuLieu: 'select', hienThiList: true, batBuoc: false, tuDong: false, hienThiDetail: true },
    ],
    version: '1.0',
    updatedAt: ''
};

 
interface Props {
    nhanSuId: string;
}

export default function Tab_KhachHangPhuTrach({ nhanSuId }: Props) {
    return (
        <div className="h-full flex flex-col">
            {/* Khung chứa danh sách */}
          
        </div>
    );
}
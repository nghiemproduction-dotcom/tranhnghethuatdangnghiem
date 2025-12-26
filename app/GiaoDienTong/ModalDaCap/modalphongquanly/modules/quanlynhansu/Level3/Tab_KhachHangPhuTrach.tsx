'use client';
import React from 'react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import Level2_Generic from '../Level2/Level2'; 

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

// 🟢 Ép kiểu Level2 để tránh lỗi TypeScript lặt vặt
const Level2_Any = Level2_Generic as any;

interface Props {
    nhanSuId: string;
}

export default function Tab_KhachHangPhuTrach({ nhanSuId }: Props) {
    return (
        <div className="h-full flex flex-col">
            {/* Khung chứa danh sách */}
            <div className="flex-1 border border-[#8B5E3C]/20 rounded-xl overflow-hidden relative bg-[#0a0807] shadow-inner min-h-[400px]">
                <Level2_Any 
                    isOpen={true}
                    config={CONFIG_KHACH_HANG_EMBED}
                    isEmbedded={true} 
                    // 🟢 Lọc khách hàng theo ID nhân sự này
                    extraFilter={{ sale_id: nhanSuId }}
                />
            </div>
        </div>
    );
}
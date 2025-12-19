'use client';

import React from 'react';
import DashboardBuilder from '@/app/GiaoDienTong/DashboardBuilder/DashboardBuilder';
import { ModuleConfig } from '@/app/GiaoDienTong/KieuDuLieuModule';

export default function ModulesPage() {
    
    // 🟢 CẤU HÌNH TĨNH CHO MODULE MẪU SẢN PHẨM (CUSTOM)
    const staticModules: ModuleConfig[] = [
        {
            id: 'mod_msp_custom_doc',
            tenModule: 'MẪU SẢN PHẨM (Quy Chuẩn)',
            bangDuLieu: 'mau_san_pham',
            moduleType: 'custom',
            customId: 'custom_mau_san_pham', // ID để gọi component đặc biệt
            
            // Layout
            doRong: 2, 
            rowHeight: 750, 
            rowId: 'row_msp_main',
            
            // Cấu hình hiển thị Widget (Biểu đồ cột theo Thể loại)
            viewType: 'chart',
            widgetData: {
                chartType: 'Bar',
                labelField: 'the_loai', // Tên cột: Thể loại
                valueField: '',         // Đếm số lượng
            },

            // Cấu hình Danh sách
            kieuHienThiList: 'card',

            // 🟢 DANH SÁCH CỘT CHUẨN (Khớp 100% với SQL MỚI)
            danhSachCot: [
                // 1. ID
                { key: 'id', label: 'ID Mẫu', kieuDuLieu: 'readonly', hienThiList: false, hienThiDetail: true, tuDong: true },
                
                // 2. Mô Tả (Thay thế Tên Mẫu)
                { key: 'mo_ta', label: 'Mô Tả / Tên Mẫu', kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true, batBuoc: true },
                
                // 3. Thể Loại
                { key: 'the_loai', label: 'Thể Loại', kieuDuLieu: 'select_dynamic', hienThiList: true, hienThiDetail: true, batBuoc: true },
                
                // 4. File Thiết Kế
                { key: 'file_thiet_ke', label: 'File Thiết Kế (Drive)', kieuDuLieu: 'link_array', hienThiList: false, hienThiDetail: true },
                
                // 5. Ảnh
                { key: 'hinh_anh', label: 'Hình Ảnh', kieuDuLieu: 'image', hienThiList: true, hienThiDetail: true },

                // --- CÁC CỘT TỰ ĐỘNG ---
                
                // 6. Người Đăng
                { key: 'nguoi_dang_mau', label: 'Người Đăng', kieuDuLieu: 'readonly', hienThiList: true, hienThiDetail: true, tuDong: true },
                
                // 7. Thời Điểm Đăng
                { key: 'thoi_diem_dang_mau', label: 'Thời Điểm Đăng', kieuDuLieu: 'datetime', hienThiList: true, hienThiDetail: true, tuDong: true },
                
                // 8. Lịch Sử Chỉnh Sửa
                { key: 'lich_su_chinh_sua', label: 'Lịch Sử Chỉnh Sửa', kieuDuLieu: 'history', hienThiList: false, hienThiDetail: true, tuDong: true },
            ],
            
            version: '2.0',
            updatedAt: new Date().toISOString()
        }
    ];

    return (
        <DashboardBuilder 
            pageId="trang_modules_tong_hop" 
            title="KHO DỮ LIỆU ĐẶC BIỆT" 
            
            allowedRoles={['admin', 'adminsystem', 'quanly', 'thietke', 'boss']} 
            
            // Load từ code & Ẩn nút thêm
            initialModules={staticModules}
            hideAddButton={true}
        />
    );
}
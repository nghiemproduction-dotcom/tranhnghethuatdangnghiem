'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserCircle } from 'lucide-react';

import NutMenu from '@/app/GiaoDienTong/MenuDuoi/GiaoDien/NutMenu';
// Import component Level 3
// import TrangChuLevel3 from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/level3generic/level3generic';
import GenericModule from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/GenericModule';

// CẤU HÌNH CỨNG CHO HỒ SƠ CÁ NHÂN
// 🟢 QUAN TRỌNG: Sử dụng kiểu 'any' để tránh lỗi TypeScript bắt bẻ các trường như 'tieuDeCot', 'tabs'
const PERSONAL_CONFIG: any = {
    id: 'personal_profile',
    bangDuLieu: 'nhan_su', 
    tieuDeCot: 'ho_ten', // Giờ có thể để dòng này thoải mái
    
    // Danh sách cột hiển thị đầy đủ để không bị lỗi Loading
    danhSachCot: [
        { 
            key: 'avatar_url', label: 'Ảnh Đại Diện', kieuDuLieu: 'image', 
            batBuoc: false, readOnly: false, 
            hienThiList: true, hienThiDetail: true 
        },
        { 
            key: 'ho_ten', label: 'Họ và Tên', kieuDuLieu: 'text', 
            batBuoc: true, readOnly: false,
            hienThiList: true, hienThiDetail: true
        },
        { 
            key: 'so_dien_thoai', label: 'Số Điện Thoại', kieuDuLieu: 'phone', 
            batBuoc: true, readOnly: false,
            hienThiList: true, hienThiDetail: true
        },
        { 
            key: 'email', label: 'Email', kieuDuLieu: 'text', 
            batBuoc: false, readOnly: true, 
            hienThiList: true, hienThiDetail: true
        }, 
        { 
            key: 'chuc_vu', label: 'Chức Vụ', kieuDuLieu: 'text', 
            batBuoc: false, readOnly: true, 
            hienThiList: true, hienThiDetail: true
        }, 
        { 
            key: 'dia_chi', label: 'Địa Chỉ', kieuDuLieu: 'text', 
            batBuoc: false, readOnly: false,
            hienThiList: false, hienThiDetail: true
        },
        { 
            key: 'cccd', label: 'CCCD/CMND', kieuDuLieu: 'text', 
            batBuoc: false, readOnly: false,
            hienThiList: false, hienThiDetail: true
        }
    ],
    // Các tab phụ
    tabs: [
        { id: 'nhat_ky_hoat_dong', label: 'Nhật Ký' }
    ]
};

interface Props {
    nguoiDung: any; 
    isOpen: boolean;       
    onToggle: () => void;  
    onClose: () => void;
}

export default function NutCaNhan({ nguoiDung, isOpen, onToggle, onClose }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSuccess = () => {
        console.log("Cập nhật hồ sơ cá nhân thành công!");
    };

    // Modal nội dung Level 3
    const modalContent = isOpen && nguoiDung ? (
        <GenericModule
            mode="level3"
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={handleSuccess}
            config={PERSONAL_CONFIG}
            initialData={nguoiDung}
            userRole={nguoiDung.role || nguoiDung.vi_tri || 'user'}
            userEmail={nguoiDung.email}
            parentTitle="HỒ SƠ CÁ NHÂN"
        />
    ) : null;

    return (
        <>
            <div className="relative z-[3000]">
                <NutMenu 
                    label="Cá Nhân" 
                    icon={UserCircle} 
                    active={isOpen} 
                    onClick={onToggle} 
                />
            </div>

            {mounted && modalContent && createPortal(modalContent, document.body)}
        </>
    );
}
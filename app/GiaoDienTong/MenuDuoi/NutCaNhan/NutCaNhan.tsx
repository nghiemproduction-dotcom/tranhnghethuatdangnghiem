'use client';
import React, { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';

import NutMenu from '@/app/GiaoDienTong/MenuDuoi/GiaoDien/NutMenu';
// 🟢 IMPORT LEVEL 3 (Đường dẫn tương đối có thể khác tùy máy bạn, hãy chỉnh lại nếu cần)
import Level3_FormChiTiet from '../../ModalDaCap/modalphongquanly/modules/quanlynhansu/Level3/level3';

interface Props {
    nguoiDung: any; 
    isOpen: boolean;       
    onToggle: () => void;  
    onClose: () => void;
}

export default function NutCaNhan({ nguoiDung, isOpen, onToggle, onClose }: Props) {
    const [openStates, setOpenStates] = useState({});

    const closeAllModals = () => {
        setOpenStates({});
    };

    useEffect(() => {
        if (!isOpen) {
            closeAllModals();
        }
    }, [isOpen]);

    // 🟢 CẤU HÌNH GIẢ LẬP (ĐÃ FIX LỖI TYPESCRIPT)
    // Thêm 'as any' để TypeScript không bắt bẻ các trường thiếu lặt vặt khác
    const personalConfig: any = {
        id: 'personal_profile',
        tenModule: 'Hồ Sơ Cá Nhân',
        bangDuLieu: 'nhan_su', // Quan trọng: Trỏ đúng vào bảng nhân sự
        loaiDuLieu: 'sql',
        danhSachCot: [],
        
        // 🟢 BỔ SUNG CÁC TRƯỜNG THIẾU ĐỂ KHÔNG BÁO LỖI
        version: '1.0', 
        updatedAt: new Date().toISOString()
    };

    return (
        <>
            <div className="relative z-[3000]">
                <NutMenu 
                    label="Cá Nhân" 
                    icon={UserCircle} 
                    active={isOpen} 
                    onClick={() => {
                        if (isOpen) onClose();
                        else onToggle();
                    }} 
                />
            </div>

            {/* 🟢 KHI MỞ, GỌI THẲNG LEVEL 3 RA */}
            {isOpen && nguoiDung && (
                <Level3_FormChiTiet
                    isOpen={true}
                    onClose={onClose}
                    onSuccess={() => {
                        alert("Cập nhật hồ sơ thành công!");
                    }}
                    config={personalConfig}     // Config đã fix
                    initialData={nguoiDung}     // Dữ liệu người dùng
                    userRole={nguoiDung.role || 'user'} 
                    userEmail={nguoiDung.email} // Để nhận diện chính chủ
                />
            )}
        </>
    );
}
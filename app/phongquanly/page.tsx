'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
import ThanhPhongChucNang from '@/app/components/ThanhPhongChucNang';
import { NhanSuChucNang } from '@/app/components/cacchucnang/nhansu';
import { KhachHangChucNang } from '@/app/components/cacchucnang/khachhang';
import { Users, UserCheck } from 'lucide-react';

// Quyền của Quản lý: xem, sửa, bulk - KHÔNG xóa
const QUANLY_PERMISSIONS = {
    allowView: true,
    allowEdit: true,
    allowDelete: false,
    allowBulk: true,
};

const QUANLY_FUNCTIONS = [
    { id: 'nhansu', label: 'NHÂN SỰ', icon: Users },
    { id: 'khachhang', label: 'KHÁCH HÀNG', icon: UserCheck },
];

export default function PhongQuanLy() {
    const { user: contextUser, loading: contextLoading } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFunction, setActiveFunction] = useState<string>('nhansu');

    useEffect(() => {
        if (!contextLoading) setAuthLoading(false);
    }, [contextLoading]);

    // Loading state
    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Get user info
    let displayUser = contextUser;
    if (!displayUser && typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('USER_INFO');
            displayUser = stored ? JSON.parse(stored) : null;
        } catch (e) {
            displayUser = null;
        }
    }

    return (
        <KhungTrangChuan
            nguoiDung={displayUser}
            loiChao="PHÒNG QUẢN LÝ"
            contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]"
        >
            {/* Thanh Phòng + Chức Năng */}
            <ThanhPhongChucNang
                tenPhong="PHÒNG QUẢN LÝ"
                functions={QUANLY_FUNCTIONS}
                activeFunction={activeFunction}
                onFunctionChange={setActiveFunction}
            />

            {/* Content Area */}
            <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
                
                <div className="absolute inset-0 z-10">
                    <div className="w-full h-full flex flex-col relative">
                        
                        {/* Nhân sự */}
                        {activeFunction === 'nhansu' && (
                            <NhanSuChucNang permissions={QUANLY_PERMISSIONS} />
                        )}

                        {/* Khách hàng */}
                        {activeFunction === 'khachhang' && (
                            <KhachHangChucNang permissions={QUANLY_PERMISSIONS} />
                        )}
                        
                    </div>
                </div>
            </div>
        </KhungTrangChuan>
    );
}

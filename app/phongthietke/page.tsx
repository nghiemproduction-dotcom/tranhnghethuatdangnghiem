'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
import ThanhPhongChucNang from '@/app/components/ThanhPhongChucNang';
import { KhachHangChucNang } from '@/app/components/cacchucnang/khachhang';
import { UserCheck } from 'lucide-react';

// Quyền của Thiết kế: xem - KHÔNG sửa, KHÔNG xóa
const THIETKE_PERMISSIONS = {
    allowView: true,
    allowEdit: false,
    allowDelete: false,
    allowBulk: false,
};

const THIETKE_FUNCTIONS = [
    { id: 'khachhang', label: 'KHÁCH HÀNG', icon: UserCheck },
];

export default function PhongThietKe() {
    const { user: contextUser, loading: contextLoading } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFunction, setActiveFunction] = useState<string>('khachhang');

    useEffect(() => {
        if (!contextLoading) setAuthLoading(false);
    }, [contextLoading]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

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
            loiChao="PHÒNG THIẾT KẾ"
            contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]"
        >
            <ThanhPhongChucNang
                tenPhong="PHÒNG THIẾT KẾ"
                functions={THIETKE_FUNCTIONS}
                activeFunction={activeFunction}
                onFunctionChange={setActiveFunction}
            />

            <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
                
                <div className="absolute inset-0 z-10">
                    <div className="w-full h-full flex flex-col relative">
                        {activeFunction === 'khachhang' && (
                            <KhachHangChucNang permissions={THIETKE_PERMISSIONS} />
                        )}
                    </div>
                </div>
            </div>
        </KhungTrangChuan>
    );
}

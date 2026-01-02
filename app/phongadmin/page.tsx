/**
 * ============================================================
 * PHÒNG ADMIN - COMMAND CENTER
 * ============================================================
 * 
 * File page duy nhất của phòng admin.
 * Gọi các chức năng từ cacchucnang với quyền FULL.
 * 
 * QUYỀN HẠN PHÒNG ADMIN:
 * - allowView: ✅ Xem tất cả
 * - allowEdit: ✅ Sửa tất cả
 * - allowDelete: ✅ Xóa tất cả
 * - allowBulk: ✅ Thao tác hàng loạt
 * 
 * CÁC CHỨC NĂNG:
 * - Tổng quan Dashboard
 * - Nhân sự (full quyền)
 * - Khách hàng (full quyền)
 * - Data Center (admin only)
 * - Cài đặt hệ thống (admin only)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { 
    Users, BookUser, LayoutDashboard, Database, Settings 
} from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
import ThanhPhongChucNang from '@/app/components/ThanhPhongChucNang';

// Import chức năng từ cacchucnang
import { NhanSuChucNang } from '@/app/components/cacchucnang';
import { KhachHangChucNang } from '@/app/components/cacchucnang/khachhang';

// ============================================================
// QUYỀN HẠN PHÒNG ADMIN - FULL ACCESS
// ============================================================

const ADMIN_PERMISSIONS = {
    nhansu: {
        allowView: true,
        allowEdit: true,
        allowDelete: true,
        allowBulk: true,
    },
    khachhang: {
        allowView: true,
        allowEdit: true,
        allowDelete: true,
        allowBulk: true,
    },
    // Thêm quyền cho các chức năng khác...
};

// ============================================================
// DANH SÁCH CHỨC NĂNG
// ============================================================

const ADMIN_FUNCTIONS = [
     
    // Quản lý người dùng
    { id: 'nhansu', label: 'NHÂN SỰ', icon: Users },
    { id: 'khachhang', label: 'KHÁCH HÀNG', icon: BookUser },
    // Admin only
  
    
];

// ============================================================
// COMPONENT CHÍNH
// ============================================================

export default function PhongAdminPage() {
    const { user: contextUser, loading: contextLoading } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFunction, setActiveFunction] = useState<string>('dashboard');

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

    // ========================================
    // RENDER
    // ========================================

    return (
        <KhungTrangChuan
            nguoiDung={displayUser}
            loiChao="ADMIN COMMAND CENTER"
            contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]"
        >
            {/* Thanh Phòng + Chức Năng */}
            <ThanhPhongChucNang
                tenPhong="PHÒNG ADMIN"
                functions={ADMIN_FUNCTIONS}
                activeFunction={activeFunction}
                onFunctionChange={setActiveFunction}
            />

            {/* Content Area */}
            <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
                
                <div className="absolute inset-0 z-10">
                    <div className="w-full h-full flex flex-col relative">
                        
                        {/* ====== RENDER CÁC CHỨC NĂNG ====== */}
 

                        {/* Nhân sự - GỌI TỪ CACCHUCNANG với quyền ADMIN */}
                        {activeFunction === 'nhansu' && (
                            <NhanSuChucNang permissions={ADMIN_PERMISSIONS.nhansu} />
                        )}

                        {/* Khách hàng - GỌI TỪ CACCHUCNANG với quyền ADMIN */}
                        {activeFunction === 'khachhang' && (
                            <KhachHangChucNang permissions={ADMIN_PERMISSIONS.khachhang} />
                        )}

                    

                    </div>
                </div>
            </div>
        </KhungTrangChuan>
    );
}

// ============================================================
// COMPONENTS PHỤ
// ============================================================

function PlaceholderScreen({ text }: { text: string }) {
    return (
        <div className="h-full flex items-center justify-center text-white/30 font-bold uppercase">
            {text}
        </div>
    );
}

function DashboardPlaceholder() {
    return (
        <div className="h-full flex flex-col items-center justify-center text-white/30">
            <LayoutDashboard size={64} className="mb-4 opacity-30" />
            <p className="font-bold uppercase">Dashboard Tổng Quan</p>
            <p className="text-sm mt-2">Đang phát triển...</p>
        </div>
    );
}

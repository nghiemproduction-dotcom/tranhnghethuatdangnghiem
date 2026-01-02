'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { Users, BookUser, ShoppingCart, History, Wallet, Package, PieChart, Receipt, Archive, BarChart3 } from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
import ThanhPhongChucNang from '@/app/components/ThanhPhongChucNang';

// Import các Manager từ các phòng khác
import NhanSuManager from '@/app/phongquanly/nhansu';
import KhachHangManager from '@/app/phongquanly/KhachHang';
import BanHangPOS from '@/app/phongsales/BanHangPOS';
import DonHangManager from '@/app/phongsales/DonHangManager';
import ThuChiManager from '@/app/phongketoan/ThuChiManager';
import VatTuManager from '@/app/phongkho/VatTuManager';

const MANAGER_FUNCTIONS = [
    // HR & Khách hàng
    { id: 'hr', label: 'NHÂN SỰ', icon: Users },
    { id: 'customers', label: 'KHÁCH HÀNG', icon: BookUser },
    // Sales
    { id: 'pos', label: 'BÁN HÀNG', icon: ShoppingCart },
    { id: 'orders', label: 'LỊCH SỬ ĐƠN', icon: History },
    // Kế toán
    { id: 'thuchi', label: 'THU CHI', icon: Wallet },
    { id: 'baocao', label: 'BÁO CÁO', icon: PieChart },
    // Kho
    { id: 'vattu', label: 'KHO VẬT TƯ', icon: Package },
];

export default function PhongQuanLy() {
    const { user: contextUser, loading: contextLoading } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFunction, setActiveFunction] = useState<string>('hr');

    useEffect(() => { if (!contextLoading) setAuthLoading(false); }, [contextLoading]);

    if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-16 h-16 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin"></div></div>;

    let displayUser = contextUser;
    if (!displayUser && typeof window !== 'undefined') {
        try { const stored = localStorage.getItem('USER_INFO'); displayUser = stored ? JSON.parse(stored) : null; } catch (e) { displayUser = null; }
    }

    return (
        <KhungTrangChuan nguoiDung={displayUser} loiChao="HỆ THỐNG QUẢN TRỊ" contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]">
            {/* Thanh Phòng + Chức Năng */}
            <ThanhPhongChucNang 
                tenPhong="PHÒNG QUẢN LÝ"
                functions={MANAGER_FUNCTIONS}
                activeFunction={activeFunction}
                onFunctionChange={setActiveFunction}
            />

            <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none"></div>
                <div className="absolute inset-0 z-10">
                    <div className="w-full h-full flex flex-col relative">
                        {/* Nhân sự & Khách hàng */}
                        {activeFunction === 'hr' && <NhanSuManager allowDelete={false} />}
                        {activeFunction === 'customers' && <KhachHangManager allowDelete={false} />}
                        {/* Sales */}
                        {activeFunction === 'pos' && <BanHangPOS />}
                        {activeFunction === 'orders' && <DonHangManager />}
                        {/* Kế toán */}
                        {activeFunction === 'thuchi' && <ThuChiManager />}
                        {activeFunction === 'baocao' && <div className="h-full flex items-center justify-center text-white/30 font-bold uppercase">Báo cáo đang phát triển</div>}
                        {/* Kho */}
                        {activeFunction === 'vattu' && <VatTuManager />}
                    </div>
                </div>
            </div>
        </KhungTrangChuan>
    );
}
'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { Wallet, PieChart, Receipt } from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
import ThanhPhongChucNang from '@/app/components/ThanhPhongChucNang';
import ThuChiManager from './ThuChiManager';

const KT_FUNCTIONS = [
    { id: 'thuchi', label: 'SỔ THU CHI', icon: Wallet },
    { id: 'baocao', label: 'BÁO CÁO LỜI LỖ', icon: PieChart },
    { id: 'congno', label: 'CÔNG NỢ', icon: Receipt },
];

export default function PhongKeToanPage() {
    const { user: contextUser, loading: contextLoading } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFunction, setActiveFunction] = useState<string>('thuchi');

    useEffect(() => { if (!contextLoading) setAuthLoading(false); }, [contextLoading]);

    if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-16 h-16 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin"></div></div>;

    let displayUser = contextUser;
    if (!displayUser && typeof window !== 'undefined') {
        try { const stored = localStorage.getItem('USER_INFO'); displayUser = stored ? JSON.parse(stored) : null; } catch (e) { displayUser = null; }
    }

    return (
        <KhungTrangChuan nguoiDung={displayUser} loiChao="QUẢN TRỊ TÀI CHÍNH" contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]">
            {/* Thanh Phòng + Chức Năng */}
            <ThanhPhongChucNang 
                tenPhong="KẾ TOÁN"
                functions={KT_FUNCTIONS}
                activeFunction={activeFunction}
                onFunctionChange={setActiveFunction}
            />

            {/* Content Area */}
            <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none"></div>
                <div className="absolute inset-0 z-10">
                    <div className="w-full h-full flex flex-col relative">
                        {activeFunction === 'thuchi' && <ThuChiManager />}
                        {activeFunction !== 'thuchi' && <div className="h-full flex items-center justify-center text-white/30 font-bold uppercase">Chức năng đang phát triển</div>}
                    </div>
                </div>
            </div>
        </KhungTrangChuan>
    );
}
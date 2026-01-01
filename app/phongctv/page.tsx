'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { TrendingUp, Package, ShoppingBag, ChevronLeft, ChevronRight, DollarSign, Wallet } from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
import TongQuanCTV from './TongQuanCTV';
import SanPhamCTV from './SanPhamCTV';
import DonHangCTV from './DonHangCTV';

const CTV_FUNCTIONS = [
    { id: 'tongquan', label: 'THU NHẬP', icon: TrendingUp },
    { id: 'sanpham', label: 'LẤY HÀNG', icon: Package },
    { id: 'donhang', label: 'LÊN ĐƠN', icon: ShoppingBag },
];

export default function PhongCTV() {
    const { user: contextUser, loading: contextLoading } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFunction, setActiveFunction] = useState<string>('tongquan');
    const tabsRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (!contextLoading) setAuthLoading(false); }, [contextLoading]);

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsRef.current) {
            const scrollAmount = 150;
            tabsRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C69C6D]"></div></div>;

    let displayUser = contextUser;
    if (!displayUser && typeof window !== 'undefined') {
        try { const stored = localStorage.getItem('USER_INFO'); displayUser = stored ? JSON.parse(stored) : null; } catch (e) { displayUser = null; }
    }

    return (
        <KhungTrangChuan nguoiDung={displayUser} loiChao="ĐỐI TÁC CHIẾN LƯỢC" contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]">
            {/* HEADER KIỂU VÍ TIỀN */}
            <div className="flex-none z-30 w-full h-[60px] bg-[#080808] border-b border-[#C69C6D]/30 shadow-lg flex items-center px-2 gap-2 md:px-4">
                <div className="shrink-0 bg-gradient-to-r from-green-600 to-green-800 text-white px-4 py-2 rounded-l-lg rounded-r-2xl transform skew-x-[-10deg] shadow-[0_0_15px_rgba(34,197,94,0.4)] border-r-4 border-white/20">
                    <h1 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] skew-x-[10deg] whitespace-nowrap flex items-center gap-2">
                        <Wallet size={16}/> CTV HUB
                    </h1>
                </div>
                <div className="flex-1 flex items-center min-w-0 gap-1 overflow-hidden">
                    <button onClick={() => scrollTabs('left')} className="p-1 text-[#C69C6D] hover:bg-white/10 rounded shrink-0 active:scale-95"><ChevronLeft size={20}/></button>
                    <div ref={tabsRef} className="flex-1 overflow-x-auto scrollbar-hide flex items-center gap-2 pl-1 mask-linear-fade">
                        <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                        {CTV_FUNCTIONS.map((func) => (
                            <button key={func.id} onClick={() => setActiveFunction(func.id)} className={`flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-2 rounded transition-all whitespace-nowrap border ${func.id === activeFunction ? 'bg-white/10 text-[#C69C6D] border-[#C69C6D]' : 'bg-transparent text-gray-500 border-transparent'}`}>
                                <func.icon size={14} /> {func.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => scrollTabs('right')} className="p-1 text-[#C69C6D] hover:bg-white/10 rounded shrink-0 active:scale-95"><ChevronRight size={20}/></button>
                </div>
            </div>

            <div className="flex-1 w-full relative overflow-hidden bg-[#050505]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#C69C6D]/5 via-transparent to-black pointer-events-none"></div>
                <div className="absolute inset-0 z-10 p-4 overflow-y-auto custom-scrollbar">
                    {activeFunction === 'tongquan' && <TongQuanCTV />}
                    {activeFunction === 'sanpham' && <SanPhamCTV />}
                    {activeFunction === 'donhang' && <DonHangCTV />}
                </div>
            </div>
        </KhungTrangChuan>
    );
}
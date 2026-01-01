'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { Wallet, PieChart, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
import ThuChiManager from './ThuChiManager'; // Sẽ tạo bên dưới

const KT_FUNCTIONS = [
    { id: 'thuchi', label: 'SỔ THU CHI', icon: Wallet },
    { id: 'baocao', label: 'BÁO CÁO LỜI LỖ', icon: PieChart },
    { id: 'congno', label: 'CÔNG NỢ', icon: Receipt },
];

export default function PhongKeToan() {
    const { user: contextUser, loading: contextLoading } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFunction, setActiveFunction] = useState<string>('thuchi');
    const tabsRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (!contextLoading) setAuthLoading(false); }, [contextLoading]);

    if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C69C6D]"></div></div>;

    let displayUser = contextUser;
    if (!displayUser && typeof window !== 'undefined') {
        try { const stored = localStorage.getItem('USER_INFO'); displayUser = stored ? JSON.parse(stored) : null; } catch (e) { displayUser = null; }
    }

    return (
        <KhungTrangChuan nguoiDung={displayUser} loiChao="QUẢN TRỊ TÀI CHÍNH" contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]">
            <div className="flex-none z-30 w-full h-[60px] bg-[#080808] border-b border-[#C69C6D]/30 shadow-[0_5px_15px_rgba(0,0,0,0.8)] flex items-center px-2 gap-2 md:px-4 md:gap-4">
                <div className="shrink-0 bg-[#C69C6D] text-black px-4 md:px-6 py-2 rounded-l-lg rounded-r-2xl transform skew-x-[-10deg] shadow-[0_0_15px_rgba(198,156,109,0.5)] border-r-4 border-white/20">
                    <h1 className="text-xs md:text-base font-black uppercase tracking-[0.2em] skew-x-[10deg] whitespace-nowrap">KẾ TOÁN</h1>
                </div>
                <div className="flex-1 flex items-center min-w-0 gap-1 md:gap-2">
                     {/* TAB HEADER (Giống Admin) */}
                     <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full">
                        <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                        {KT_FUNCTIONS.map((func) => {
                            const Icon = func.icon;
                            const isActive = func.id === activeFunction;
                            return (
                                <button key={func.id} onClick={() => setActiveFunction(func.id)} className={`flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase px-3 md:px-5 py-2 rounded transition-all whitespace-nowrap border ${isActive ? 'bg-white/10 text-[#C69C6D] border-[#C69C6D]' : 'bg-transparent text-gray-500 border-transparent hover:text-white'}`}>
                                    <Icon size={14} /> {func.label}
                                </button>
                            )
                        })}
                     </div>
                </div>
            </div>

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
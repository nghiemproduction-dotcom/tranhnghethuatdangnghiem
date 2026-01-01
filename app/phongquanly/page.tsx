'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { 
    ShoppingBag, Users, BarChart3, ChevronLeft, ChevronRight,
    ClipboardList 
} from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';

// Import các Module chức năng
import NhanSuManager from '@/app/phongquanly/nhansu';
import DonHangManager from '@/app/phongquanly/DonHang';

// Cấu hình các chức năng của Phòng Quản Lý
const MANAGER_FUNCTIONS = [
    { id: 'orders', label: 'QUẢN LÝ ĐƠN HÀNG', icon: ShoppingBag },
    { id: 'hr', label: 'QUẢN LÝ NHÂN SỰ', icon: Users },
    { id: 'tasks', label: 'PHÂN CÔNG VIỆC', icon: ClipboardList },
    { id: 'reports', label: 'BÁO CÁO DOANH THU', icon: BarChart3 },
];

export default function PhongQuanLy() {
    const { user: contextUser, loading: contextLoading } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFunction, setActiveFunction] = useState<string>('orders');
    const tabsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contextLoading) return;
        setAuthLoading(false);
    }, [contextLoading]);

    // Logic cuộn thanh Tab (giống Admin)
    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsRef.current) {
            const scrollAmount = 200;
            tabsRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (authLoading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    
    // Lấy user từ context hoặc localStorage để hiển thị
    let displayUser = contextUser;
    if (!displayUser && typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('USER_INFO');
            displayUser = stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.warn('Failed to parse USER_INFO from localStorage:', e);
            displayUser = null;
        }
    }

    return (
        <KhungTrangChuan 
            nguoiDung={displayUser} 
            loiChao="HỆ THỐNG QUẢN TRỊ" 
            contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]"
        >
            {/* --- HEADER GAMING 1 HÀNG --- */}
            <div className="flex-none z-30 w-full h-[60px] bg-[#080808] border-b border-[#C69C6D]/30 shadow-[0_5px_15px_rgba(0,0,0,0.8)] flex items-center px-4 gap-4">
                
                {/* TRÁI: LABEL PHÒNG (Nổi bật) */}
                <div className="shrink-0 bg-[#C69C6D] text-black px-6 py-2 rounded-l-lg rounded-r-2xl transform skew-x-[-10deg] shadow-[0_0_15px_rgba(198,156,109,0.5)] border-r-4 border-white/20">
                    <h1 className="text-sm md:text-base font-black uppercase tracking-[0.2em] skew-x-[10deg] whitespace-nowrap">
                        PHÒNG QUẢN LÝ
                    </h1>
                </div>

                {/* PHẢI: CHỨC NĂNG (Scrollable Tabs) */}
                <div className="flex-1 flex items-center min-w-0 gap-2">
                    {/* Nút Scroll Trái (Ẩn trên mobile) */}
                    <button onClick={() => scrollTabs('left')} className="p-1 text-[#C69C6D] hover:bg-white/10 rounded hidden md:block">
                        <ChevronLeft size={20}/>
                    </button>
                    
                    {/* Danh sách Tabs */}
                    <div ref={tabsRef} className="flex-1 overflow-x-auto scrollbar-hide flex items-center gap-2 pl-2 mask-linear-fade">
                        <style jsx>{`
                            .scrollbar-hide::-webkit-scrollbar { display: none; }
                            .mask-linear-fade { mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%); }
                        `}</style>
                        
                        {MANAGER_FUNCTIONS.map((func) => {
                            const Icon = func.icon;
                            const isActive = func.id === activeFunction;
                            return (
                                <button 
                                    key={func.id}
                                    onClick={() => setActiveFunction(func.id)}
                                    className={`flex items-center gap-2 text-[11px] font-bold uppercase px-5 py-2 rounded transition-all whitespace-nowrap border
                                        ${isActive 
                                            ? 'bg-white/10 text-[#C69C6D] border-[#C69C6D] shadow-[0_0_15px_rgba(198,156,109,0.2)]' 
                                            : 'bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <Icon size={14} strokeWidth={2.5} />
                                    {func.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Nút Scroll Phải */}
                    <button onClick={() => scrollTabs('right')} className="p-1 text-[#C69C6D] hover:bg-white/10 rounded hidden md:block">
                        <ChevronRight size={20}/>
                    </button>
                </div>
            </div>

            {/* --- MAIN VIEWPORT (NỀN CARBON) --- */}
            <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
                {/* Lớp phủ gradient để nền tối hơn */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none"></div>
                
                {/* Nội dung chính */}
                <div className="absolute inset-0 z-10">
                    <div className="w-full h-full flex flex-col relative">
                        
                        {/* 1. QUẢN LÝ ĐƠN HÀNG */}
                        {activeFunction === 'orders' && <DonHangManager />}
                        
                        {/* 2. QUẢN LÝ NHÂN SỰ (QUAN TRỌNG: Không được xóa) */}
                        {activeFunction === 'hr' && <NhanSuManager allowDelete={false} />}
                        
                        {/* 3. PLACEHOLDER CHO CÁC CHỨC NĂNG KHÁC */}
                        {(activeFunction === 'reports' || activeFunction === 'tasks') && (
                            <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-4">
                                <BarChart3 size={64} strokeWidth={1} />
                                <div className="text-xl font-black uppercase tracking-widest text-center">
                                    MODULE ĐANG ĐƯỢC PHÁT TRIỂN
                                </div>
                                <p className="text-sm font-mono text-white/20">System v2.5.0 - Coming Soon</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </KhungTrangChuan>
    );
}
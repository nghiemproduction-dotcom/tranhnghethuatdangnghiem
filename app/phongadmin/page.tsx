'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { 
    Users, ChevronLeft, ChevronRight, BookUser
} from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';

// Import Modules
import NhanSuManager from '@/app/phongquanly/nhansu';
import KhachHangManager from '@/app/phongquanly/KhachHang';

const ADMIN_FUNCTIONS = [
    { id: 'hr', label: 'NHÂN SỰ', icon: Users },
    { id: 'customers', label: 'KHÁCH HÀNG', icon: BookUser },
];

export default function PhongAdminPage() {
    // ... (Giữ nguyên logic state, scrollTabs...)
    const { user: contextUser, loading: contextLoading } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFunction, setActiveFunction] = useState<string>('hr');
    const tabsRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (!contextLoading) setAuthLoading(false); }, [contextLoading]);

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsRef.current) {
            const scrollAmount = 150; 
            tabsRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-16 h-16 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin"></div></div>;
    
    // ... (Logic displayUser giữ nguyên)
    let displayUser: typeof contextUser = contextUser;
    if (!displayUser && typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('USER_INFO');
            displayUser = stored ? JSON.parse(stored) : null;
        } catch (e) { displayUser = null; }
    }

    return (
        <KhungTrangChuan 
            nguoiDung={displayUser} 
            loiChao="ADMIN COMMAND CENTER" 
            contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]"
        >
            {/* ... (Header giữ nguyên) */}
             <div className="flex-none z-30 w-full h-[60px] bg-[#080808] border-b border-[#C69C6D]/30 shadow-[0_5px_15px_rgba(0,0,0,0.8)] flex items-center px-2 gap-2 md:px-4 md:gap-4">
                <div className="shrink-0 bg-[#C69C6D] text-black px-4 md:px-6 py-2 rounded-l-lg rounded-r-2xl transform skew-x-[-10deg] shadow-[0_0_15px_rgba(198,156,109,0.5)] border-r-4 border-white/20">
                    <h1 className="text-xs md:text-base font-black uppercase tracking-[0.2em] skew-x-[10deg] whitespace-nowrap">PHÒNG ADMIN</h1>
                </div>
                <div className="flex-1 flex items-center min-w-0 gap-1 md:gap-2">
                    <button onClick={() => scrollTabs('left')} className="p-1 text-[#C69C6D] hover:bg-white/10 rounded shrink-0 active:scale-95 transition-transform"><ChevronLeft size={20}/></button>
                    <div ref={tabsRef} className="flex-1 overflow-x-auto scrollbar-hide flex items-center gap-2 pl-1 mask-linear-fade">
                        <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } .mask-linear-fade { mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%); } `}</style>
                        {ADMIN_FUNCTIONS.map((func) => {
                            const Icon = func.icon;
                            const isActive = func.id === activeFunction;
                            return (
                                <button key={func.id} onClick={() => setActiveFunction(func.id)} className={`flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[11px] font-bold uppercase px-3 md:px-5 py-2 rounded transition-all whitespace-nowrap border clip-path-game ${isActive ? 'bg-white/10 text-[#C69C6D] border-[#C69C6D] shadow-[0_0_15px_rgba(198,156,109,0.2)]' : 'bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}>
                                    <Icon size={14} strokeWidth={2.5} /> {func.label}
                                </button>
                            )
                        })}
                    </div>
                    <button onClick={() => scrollTabs('right')} className="p-1 text-[#C69C6D] hover:bg-white/10 rounded shrink-0 active:scale-95 transition-transform"><ChevronRight size={20}/></button>
                </div>
            </div>

            <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none"></div>
                <div className="absolute inset-0 z-10">
                    <div className="w-full h-full flex flex-col relative">
                        {activeFunction === 'hr' && <NhanSuManager allowDelete={true} />}
                        {activeFunction === 'customers' && <KhachHangManager allowDelete={true} />}
                    </div>
                </div>
            </div>
        </KhungTrangChuan>
    );
}
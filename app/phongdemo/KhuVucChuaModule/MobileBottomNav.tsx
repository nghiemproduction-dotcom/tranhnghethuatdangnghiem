'use client';
import React from 'react';
import { Home, LayoutGrid, Bell, User, PlusCircle } from 'lucide-react';

interface Props {
    onAddModule?: () => void;
}

export default function MobileBottomNav({ onAddModule }: Props) {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-[#1A1A1A]/95 backdrop-blur-md border-t border-white/10 z-[9999] pb-5 pt-3 px-6">
            <div className="flex justify-between items-center h-full">
                
                <button className="flex flex-col items-center gap-1 text-blue-500">
                    <Home size={22} />
                    <span className="text-[9px] font-bold">Trang chủ</span>
                </button>

                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <LayoutGrid size={22} />
                    <span className="text-[9px] font-bold">Module</span>
                </button>

                {/* Nút to ở giữa (Điểm nhấn) */}
                <button 
                    onClick={onAddModule}
                    className="relative -top-5 bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-900/50 border-4 border-[#12100E] active:scale-95 transition-transform"
                >
                    <PlusCircle size={28} />
                </button>

                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <Bell size={22} />
                    <span className="text-[9px] font-bold">Thông báo</span>
                </button>

                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <User size={22} />
                    <span className="text-[9px] font-bold">Cá nhân</span>
                </button>
            </div>
        </div>
    );
}
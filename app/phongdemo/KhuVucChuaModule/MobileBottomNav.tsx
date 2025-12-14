'use client';
import React from 'react';
import { Home, LayoutGrid, Bell, User, PlusCircle } from 'lucide-react';

interface Props {
    onAddModule?: () => void;
}

export default function MobileBottomNav({ onAddModule }: Props) {
    // md:hidden nghĩa là: Ẩn đi khi màn hình từ Tablet trở lên (>= 768px)
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-[#1A1A1A] border-t border-white/10 z-[9999] pb-safe pt-3 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center h-full pb-2">
                
                <button className="flex flex-col items-center gap-1 text-blue-500 transition-colors">
                    <Home size={24} strokeWidth={2.5} />
                    <span className="text-[9px] font-bold">Trang chủ</span>
                </button>

                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <LayoutGrid size={24} />
                    <span className="text-[9px] font-bold">Module</span>
                </button>

                {/* Nút Cộng To Ở Giữa */}
                <button 
                    onClick={onAddModule}
                    className="relative -top-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg shadow-blue-600/40 border-[4px] border-[#12100E] flex items-center justify-center active:scale-95 transition-transform"
                >
                    <PlusCircle size={30} />
                </button>

                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <Bell size={24} />
                    <span className="text-[9px] font-bold">Thông báo</span>
                </button>

                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <User size={24} />
                    <span className="text-[9px] font-bold">Cá nhân</span>
                </button>
            </div>
        </div>
    );
}
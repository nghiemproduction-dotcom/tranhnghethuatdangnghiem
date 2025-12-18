'use client';

import React from 'react';

// 🟢 KHAI BÁO PROPS ĐỂ SỬA LỖI
interface Props {
    onSupportClick?: () => void;
}

export default function ChanForm({ onSupportClick }: Props) {
    return (
        <div className="w-full flex flex-col items-center gap-2 mt-4">
            <div className="w-full h-[1px] bg-white/10"></div>
            <div className="flex gap-1 text-[10px] uppercase tracking-wider font-bold text-gray-600">
                <span>Power by</span>
                <span className="text-[#8B5E3C]">ArtSpace System</span>
            </div>
            
            {/* Nút Hỗ trợ */}
            <button 
                type="button" 
                onClick={onSupportClick}
                className="text-[10px] text-gray-500 hover:text-[#C69C6D] underline decoration-dotted underline-offset-4 transition-colors cursor-pointer"
            >
                Cần hỗ trợ đăng nhập?
            </button>
        </div>
    );
}
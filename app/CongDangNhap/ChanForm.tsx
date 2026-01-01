'use client';

import React from 'react';

interface Props {
    onSupportClick?: () => void;
}

export default function ChanForm({ onSupportClick }: Props) {
    return (
        <div className="w-full flex flex-col items-center gap-3 mt-6 animate-in fade-in duration-700 delay-300">
            {/* Đường kẻ mờ tinh tế */}
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#8B5E3C] to-transparent opacity-50"></div>
            
            <div className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-widest font-medium text-white/30 font-serif">
                <span>Được kiến tạo bởi</span>
                <span className="text-[#C69C6D] font-bold drop-shadow-md tracking-[0.2em]">Tommy Nghiêm Art</span>
            </div>
            
            {/* Nút Hỗ trợ */}
            <button 
                type="button" 
                onClick={onSupportClick}
                className="text-[10px] text-gray-600 hover:text-white transition-colors cursor-pointer mt-2 hover:underline decoration-dotted underline-offset-4"
            >
                Gặp sự cố đăng nhập?
            </button>
        </div>
    );
}
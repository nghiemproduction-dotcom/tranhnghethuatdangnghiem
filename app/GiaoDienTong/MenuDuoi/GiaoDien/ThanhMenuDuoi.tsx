'use client';
import React from 'react';

export default function ThanhMenuDuoi({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-full relative pointer-events-none"> {/* pointer-events-none để click xuyên qua vùng trống */}
            
            {/* 🟢 SỬA GRADIENT: Chỉ cao 32 đơn vị (h-32) và nằm sát đáy */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/90 to-transparent z-0" />
            
            {/* Nội dung menu */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center items-end pb-2 gap-8 md:gap-20 pointer-events-auto">
                {children}
            </div>
        </div>
    );
}
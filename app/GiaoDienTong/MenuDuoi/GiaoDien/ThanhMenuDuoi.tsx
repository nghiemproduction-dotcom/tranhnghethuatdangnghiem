'use client';
import React from 'react';

export default function ThanhMenuDuoi({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-full relative pointer-events-none"> 
            
            {/* Các lớp nền đã được chuyển sang page.tsx (Gradient cố định) */}
            
            {/* Container chứa nút */}
            <div className="absolute bottom-0 left-0 right-0 z-[10000] flex justify-center items-end pb-2 gap-8 md:gap-20 pointer-events-auto">
                {children}
            </div>
        </div>
    );
}
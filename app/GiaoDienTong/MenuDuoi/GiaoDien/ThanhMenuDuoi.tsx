'use client';
import React from 'react';

export default function ThanhMenuDuoi({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-full relative pointer-events-none"> 
            
            {/* 🟢 ĐÃ XÓA LỚP NỀN GRADIENT CỤC BỘ */}
            {/* Để LopPhuLanMau (z-8000) đảm nhiệm việc tạo nền tối cho toàn bộ đáy màn hình */}
            
            {/* Nội dung menu (Các nút bấm) */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center items-end pb-2 gap-8 md:gap-20 pointer-events-auto">
                {children}
            </div>
        </div>
    );
}
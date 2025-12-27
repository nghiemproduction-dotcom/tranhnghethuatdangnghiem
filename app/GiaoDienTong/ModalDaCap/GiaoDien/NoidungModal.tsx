'use client';
import React from 'react';

interface Props {
    children: React.ReactNode;
}

export default function NoidungModal({ children }: Props) {
    return (
        // 🟢 SỬA ĐỔI: Thay bg-[#0a0807] thành bg-transparent (Trong suốt)
        // Thêm pt-20 để nội dung không bị Menu Trên che mất (vì Menu Trên giờ sẽ đè lên)
        <div className="flex-1 w-full overflow-y-auto custom-scroll relative bg-transparent p-[clamp(10px,3vw,20px)] pt-24">
            {/* Wrapper để đảm bảo nội dung không bị sát lề dưới trên mobile */}
            <div className="w-full min-h-full pb-[80px]"> 
                {children}
            </div>
        </div>
    );
}
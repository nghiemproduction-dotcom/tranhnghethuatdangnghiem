'use client';
import React from 'react';

interface Props {
    children: React.ReactNode;
}

export default function NoidungModal({ children }: Props) {
    return (
        // 🟢 Z-INDEX 2500: Nằm dưới Menu/Lớp phủ
        <div className="fixed inset-0 z-[2500] flex flex-col bg-transparent animate-in fade-in zoom-in-95 duration-500 ease-out overflow-hidden shadow-none pointer-events-none">
            
            {/* 🟢 KHUNG CUỘN TRÀN VIỀN:
                - overflow-y-auto: Cho phép cuộn.
                - KHÔNG có padding ở đây.
                -> Kết quả: Thanh cuộn chạy từ đỉnh màn hình xuống đáy.
            */}
            <div className="flex-1 w-full h-full overflow-y-auto custom-scroll relative z-0 pointer-events-none">
                
                {/* Content Wrapper: Cũng không padding.
                   Padding sẽ do 'DashboardBuilder' (children) tự quyết định.
                */}
                <div className="w-full min-h-full pointer-events-none"> 
                    {children}
                </div>
            </div>
        </div>
    );
}
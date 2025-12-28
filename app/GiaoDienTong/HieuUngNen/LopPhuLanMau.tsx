'use client';
import React from 'react';

export default function LopPhuLanMau() {
    return (
        // 🟢 CẤU HÌNH:
        // - fixed inset-0: Ghim chặt vào 4 góc màn hình.
        // - w-screen: Đảm bảo phủ kín chiều rộng viewport (khắc phục lỗi hở mép phải).
        // - pointer-events-none: Để click xuyên qua xuống nội dung bên dưới.
        // - z-[9000]: (Theo cấu hình cũ) Nằm dưới Menu (9999) nhưng trên các phần tử nền khác.
        <div className="fixed inset-0 w-screen h-full pointer-events-none z-[9000]">
            
            {/* Dải Gradient Trên */}
            {/* 🟢 UPDATE: Giảm chiều cao từ h-32 (128px) xuống h-16 (64px) ~ 50% */}
            <div 
                className="absolute top-0 left-0 right-0 h-16"
                style={{
                    // Gradient đen mờ dần xuống trong suốt
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)'
                }}
            />

            {/* Dải Gradient Dưới */}
            {/* 🟢 UPDATE: Giảm chiều cao từ h-32 (128px) xuống h-16 (64px) ~ 50% */}
            <div 
                className="absolute bottom-0 left-0 right-0 h-16"
                style={{
                    // Gradient đen mờ dần lên trong suốt
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)'
                }}
            />
        </div>
    );
}
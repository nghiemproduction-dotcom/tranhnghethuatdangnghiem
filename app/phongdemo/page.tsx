'use client';

import React from 'react';

// Import nội dung chính (Bo mạch lưới)
import BangChinh from './KhuVucChuaModule/BangChinh';

export default function PhongDemo() {
  return (
    // 🟢 QUAN TRỌNG: 
    // Không dùng 'flex h-screen' nữa vì thằng Cha đã lo rồi.
    // Chỉ cần w-full để nó tràn hết phần không gian còn lại.
    <div className="w-full min-h-full bg-[#101010] text-white">
        
        {/* Header riêng của Phòng Demo (Nằm dính trên cùng) */}
        <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#101010] z-20">
             
            <div className="flex gap-2">
                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] rounded border border-yellow-500/20">
                    Mode: Developer
                </span>
            </div>
        </div>

        {/* Khu vực hiển thị Bảng Chính */}
        <div className="p-4 md:p-8">
            <BangChinh />
        </div>

    </div>
  );
}
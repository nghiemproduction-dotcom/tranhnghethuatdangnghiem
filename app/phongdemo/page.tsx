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
        
   

        {/* Khu vực hiển thị Bảng Chính */}
        <div className="p-4 md:p-8">
            <BangChinh />
        </div>

    </div>
  );
}
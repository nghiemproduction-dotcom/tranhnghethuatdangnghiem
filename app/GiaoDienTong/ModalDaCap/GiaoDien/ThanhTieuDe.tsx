'use client';
import React from 'react';

interface Props {
    tieuDe: string;
}

export default function ThanhTieuDe({ tieuDe }: Props) {
    return (
        // 🟢 Thêm pointer-events-auto (nếu muốn select text)
        <div className="w-full shrink-0 flex items-center justify-center py-2 z-40 pointer-events-auto">
            <h2 className="
                text-center uppercase font-black tracking-[0.15em] leading-tight
                text-[clamp(20px,6vw,30px)]
                bg-gradient-to-b from-[#F9F295] via-[#E0AA3E] to-[#B88A44] 
                bg-clip-text text-transparent 
                drop-shadow-[0_2px_10px_rgba(224,170,62,0.3)]
            ">
                {tieuDe}
            </h2>
        </div>
    );
}
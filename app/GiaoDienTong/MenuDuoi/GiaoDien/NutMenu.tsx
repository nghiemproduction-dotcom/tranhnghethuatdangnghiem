'use client';
import React from 'react';
import Link from 'next/link';

interface Props {
    label: string;
    icon: any;
    active?: boolean;
    onClick?: () => void;
    href?: string;
}

export default function NutMenu({ label, icon: Icon, active, onClick, href }: Props) {
    const content = (
        <div className={`flex flex-col items-center justify-center 
            w-[clamp(60px,15vw,80px)] h-[clamp(50px,12vw,60px)] 
            rounded-xl border transition-all duration-300 active:scale-95
            ${active 
                ? 'bg-[#C69C6D]/10 border-[#C69C6D] text-[#C69C6D] shadow-[0_0_10px_rgba(198,156,109,0.2)]' 
                : 'bg-[#0a0807] border-[#8B5E3C]/20 text-[#8B5E3C] hover:text-[#F5E6D3]'
            }`}
        >
            <Icon 
                className="w-[clamp(20px,5vw,24px)] h-[clamp(20px,5vw,24px)] mb-1" 
                strokeWidth={active ? 2.5 : 2} 
            />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate w-full text-center px-1">
                {label}
            </span>
        </div>
    );

    // 🟢 SỬA Ở ĐÂY: Thêm 'relative z-[3000]' vào className của cả Link và Button
    // Điều này đảm bảo nút luôn nằm lớp cao nhất, bấm là ăn ngay.
    
    if (href) {
        return (
            <Link href={href} className="shrink-0 relative z-[3000]">
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className="shrink-0 relative z-[3000]">
            {content}
        </button>
    );
}
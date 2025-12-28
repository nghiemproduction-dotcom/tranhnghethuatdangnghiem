'use client';
import React, { useState } from 'react';
import NutToiLui from '../../MenuDuoi/GiaoDien/NutToiLui'; 

interface Props {
    trangHienTai: number;
    tongSoTrang: number;
    onToi: () => void;
    onLui: () => void;
}

export default function ThanhPhanTrang({ trangHienTai, tongSoTrang, onToi, onLui }: Props) {
    // State xử lý vuốt
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50; 

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && trangHienTai < tongSoTrang) onToi();
        if (isRightSwipe && trangHienTai > 1) onLui();
    };

    return (
        <div 
            className="fixed bottom-[clamp(80px,18vw,100px)] left-0 right-0 z-[2001] flex justify-center pointer-events-none"
            // Gắn sự kiện vuốt vào container
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="pointer-events-auto flex items-center bg-[#110d0c]/95 backdrop-blur-xl border border-[#8B5E3C]/40 rounded-full shadow-[0_5px_30px_rgba(0,0,0,0.9)] px-3 py-1.5 gap-4 h-[50px] transition-transform active:scale-95">
                
                <div className="h-full scale-90 origin-center opacity-80 hover:opacity-100">
                    <NutToiLui direction="left" onClick={onLui} />
                </div>

                <div className="flex flex-col items-center justify-center min-w-[70px] select-none">
                    <span className="text-[9px] text-[#8B5E3C] uppercase font-bold tracking-[0.2em]">Trang</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-[#F5E6D3]">{trangHienTai}</span>
                        <span className="text-xs text-[#5D4037] font-bold">/</span>
                        <span className="text-xs text-[#5D4037] font-bold">{tongSoTrang}</span>
                    </div>
                </div>

                <div className="h-full scale-90 origin-center opacity-80 hover:opacity-100">
                    <NutToiLui direction="right" onClick={onToi} />
                </div>

            </div>
            
            {/* Chỉ dẫn vuốt (Chỉ hiện trên mobile) */}
            <div className="absolute -bottom-6 text-[8px] text-white/20 uppercase tracking-widest md:hidden animate-pulse">
                Vuốt để chuyển trang
            </div>
        </div>
    );
}
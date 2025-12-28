'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    trangHienTai: number;
    tongSoTrang: number;
    onToi: () => void;
    onLui: () => void;
}

export default function ThanhPhanTrang({ trangHienTai, tongSoTrang, onToi, onLui }: Props) {
    // State xử lý vuốt (Swipe)
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
            className="fixed bottom-[clamp(85px,18vw,105px)] left-0 right-0 z-[2001] flex justify-center pointer-events-none select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="pointer-events-auto flex items-center gap-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.5)] border border-white/5 transition-transform active:scale-95">
                
                {/* Nút Lui */}
                <button 
                    onClick={onLui}
                    disabled={trangHienTai <= 1}
                    className={`p-2 rounded-full transition-all ${trangHienTai <= 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 text-[#C69C6D] active:scale-90'}`}
                >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                </button>

                {/* Số trang */}
                <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-xl font-bold text-[#F5E6D3] drop-shadow-md">{trangHienTai}</span>
                    <span className="text-sm text-gray-500 font-medium">/</span>
                    <span className="text-sm text-gray-500 font-medium">{tongSoTrang}</span>
                </div>

                {/* Nút Tới */}
                <button 
                    onClick={onToi}
                    disabled={trangHienTai >= tongSoTrang}
                    className={`p-2 rounded-full transition-all ${trangHienTai >= tongSoTrang ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 text-[#C69C6D] active:scale-90'}`}
                >
                    <ChevronRight size={20} strokeWidth={2.5} />
                </button>

            </div>
            
            {/* Chỉ dẫn vuốt (Ẩn trên Desktop) */}
            <div className="absolute -bottom-5 text-[9px] font-bold text-white/10 uppercase tracking-[0.3em] md:hidden animate-pulse">
                &larr; Vuốt &rarr;
            </div>
        </div>
    );
}
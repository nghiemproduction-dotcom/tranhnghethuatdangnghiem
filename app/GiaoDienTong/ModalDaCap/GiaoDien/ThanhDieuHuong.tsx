'use client';
import React, { useMemo } from 'react';
import { ChevronRight, Home, MoreHorizontal, ArrowLeft } from 'lucide-react';

export interface CapDo {
    id: string;
    ten: string;
    onClick?: () => void;
    isSeparator?: boolean;
}

interface Props {
    danhSachCap: CapDo[];
}

export default function ThanhDieuHuong({ danhSachCap }: Props) {
    const danhSachHienThi = useMemo(() => {
        const tongSo = danhSachCap.length;
        if (tongSo <= 3) return danhSachCap;
        return [
            danhSachCap[0],
            { id: 'more', ten: '...', isSeparator: true },
            danhSachCap[tongSo - 2],
            danhSachCap[tongSo - 1]
        ];
    }, [danhSachCap]);

    return (
        <div className="w-full shrink-0 flex items-center justify-start px-6 py-4 z-50 select-none bg-transparent">
            
            <div className="flex items-center gap-2 flex-wrap">
                {danhSachHienThi.map((cap: any, index) => {
                    const laCuoi = index === danhSachHienThi.length - 1;
                    const laSeparator = cap.isSeparator;

                    // 🟢 Logic nhận diện nút Back: Chỉ cần id là 'back' và nằm đầu tiên
                    const isBack = index === 0 && cap.id === 'back';

                    // Mũi tên ngăn cách
                    const renderSeparator = index > 0 && (
                        <ChevronRight 
                            size={laCuoi ? 24 : 14} 
                            className={`shrink-0 ${laCuoi ? 'text-[#C69C6D] mx-2 opacity-100' : 'text-gray-600 opacity-50'}`} 
                        />
                    );

                    if (laSeparator) {
                        return (
                            <div key="sep" className="flex items-center gap-2">
                                <ChevronRight size={14} className="text-gray-600" />
                                <span className="text-gray-600"><MoreHorizontal size={14} /></span>
                            </div>
                        );
                    }

                    return (
                        <div key={cap.id || index} className="flex items-center">
                            {renderSeparator}

                            <button 
                                onClick={cap.onClick}
                                disabled={laCuoi}
                                className={`flex items-center gap-2 transition-all duration-300
                                    ${laCuoi 
                                        ? `
                                            font-black uppercase tracking-widest leading-none cursor-default text-left
                                            text-[clamp(20px,5vw,28px)] 
                                            text-[#C69C6D]
                                            drop-shadow-[0_2px_15px_rgba(198,156,109,0.2)]
                                          `
                                        : `text-gray-500 hover:text-[#C69C6D] font-bold text-[11px] sm:text-[12px] uppercase tracking-wide active:scale-95 ${isBack ? 'hover:text-[#C69C6D]' : ''}`
                                    }
                                `}
                            >
                                {/* 🟢 ICON LOGIC: Nếu là Back -> Mũi tên trái, Ngược lại -> Ngôi nhà */}
                                {index === 0 && (
                                    isBack 
                                    ? <ArrowLeft size={18} className="-mt-0.5 text-[#C69C6D] group-hover:-translate-x-1 transition-transform" /> 
                                    : <Home size={14} className="-mt-0.5 opacity-60" />
                                )}
                                
                                <span className={laCuoi ? '' : 'truncate max-w-[120px]'}>
                                    {cap.ten}
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
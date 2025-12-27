'use client';
import React from 'react'; 
import Link from 'next/link';
import { ChevronRight, Lock } from 'lucide-react';
import { kiemTraQuyen } from '@/app/GiaoDienTong/MenuDuoi/DuLieu';

interface Props {
    data: any[]; 
    nguoiDung: any;
    onDongModal: () => void;
    onMoModal?: (id: string) => void;
}

export default function GiaoDienDanhSach({ data, nguoiDung, onDongModal, onMoModal }: Props) {
    
    // SFX
    const playHoverSound = () => {
        const audio = new Audio('/sounds/hover.mp3'); 
        audio.volume = 0.2; 
        audio.play().catch(() => {}); 
    };

    const playClickSound = () => {
        const audio = new Audio('/sounds/click.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto px-4">
            {data.map((phong) => {
                const Icon = phong.icon;
                const coQuyen = kiemTraQuyen(nguoiDung, phong.quyenTruyCap);

                return (
                    <div 
                        key={phong.id} 
                        onMouseEnter={playHoverSound}
                        
                        className={`
                            relative group w-full min-h-[140px] p-6
                            flex flex-col items-center justify-center text-center gap-3
                            /* 🟢 STYLE KÍNH NGHỆ THUẬT (ARTISTIC GLASS) */
                            bg-[#0a0807]/80 backdrop-blur-xl border border-[#C69C6D]/30
                            rounded-xl shadow-lg transition-all duration-300
                            ${coQuyen 
                                ? 'cursor-pointer hover:bg-[#1a120f] hover:border-[#C69C6D] hover:shadow-[0_0_30px_rgba(198,156,109,0.2)] hover:-translate-y-1' 
                                : 'opacity-50 grayscale cursor-not-allowed border-[#333]'
                            }
                        `}
                    >
                        {/* Link điều hướng */}
                        {coQuyen && (
                            <>
                                {onMoModal ? (
                                    <div onClick={(e) => { e.stopPropagation(); playClickSound(); onMoModal(phong.id); }} className="absolute inset-0 z-20 w-full h-full bg-transparent" />
                                ) : (
                                    <Link href={phong.duongDan} onClick={(e) => { playClickSound(); onDongModal(); }} className="absolute inset-0 z-10" />
                                )}
                            </>
                        )}

                        {/* 1. ICON (Nằm trên cùng) */}
                        <div className={`
                            w-12 h-12 flex items-center justify-center rounded-full
                            bg-gradient-to-br from-[#2a1e1b] to-[#0a0807] border border-[#C69C6D]/20 shadow-inner
                            ${coQuyen ? 'group-hover:scale-110 group-hover:border-[#C69C6D]' : ''}
                            transition-all duration-500
                        `}>
                            <Icon 
                                size={24} 
                                className={`${coQuyen ? 'text-[#C69C6D]' : 'text-gray-600'} transition-colors`} 
                                strokeWidth={1.5}
                            />
                        </div>

                        {/* 2. NỘI DUNG CHỮ (Ở giữa, tự xuống dòng) */}
                        <div className="flex flex-col gap-1 w-full">
                            {/* Tên phòng: Cho phép xuống dòng (whitespace-normal) */}
                            <h3 className={`
                                font-sans font-bold text-base md:text-lg uppercase tracking-wide leading-tight whitespace-normal
                                ${coQuyen ? 'text-[#E8D4B9] group-hover:text-white' : 'text-gray-600'}
                                transition-colors duration-300
                            `}>
                                {phong.ten}
                            </h3>
                            
                            {/* Đường kẻ nhỏ */}
                            {coQuyen && (
                                <div className="w-8 h-[1px] bg-[#C69C6D]/50 mx-auto group-hover:w-16 transition-all duration-500" />
                            )}

                            {/* Mô tả */}
                            <p className={`text-[11px] font-medium ${coQuyen ? 'text-[#8B5E3C] group-hover:text-[#C69C6D]' : 'text-gray-700'}`}>
                                {coQuyen ? (phong.moTa || 'Truy cập ngay') : 'Khu vực hạn chế'}
                            </p>
                        </div>

                        {/* 3. TRẠNG THÁI (Góc dưới phải) */}
                        <div className={`absolute bottom-3 right-3 opacity-50 ${coQuyen ? 'group-hover:opacity-100 text-[#C69C6D]' : 'text-gray-700'}`}>
                            {coQuyen ? <ChevronRight size={14} /> : <Lock size={14} />}
                        </div>

                        {/* Hiệu ứng Glow nhẹ góc trên trái */}
                        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#C69C6D]/10 to-transparent rounded-tl-xl pointer-events-none" />
                    </div>
                );
            })}
        </div>
    );
}
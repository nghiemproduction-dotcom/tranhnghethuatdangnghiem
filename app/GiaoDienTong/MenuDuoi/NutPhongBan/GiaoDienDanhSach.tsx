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
    
    // SFX an toàn (Safe Sound Effect)
    const playSound = (type: 'hover' | 'click') => {
        try {
            const audio = new Audio(`/sounds/${type}.mp3`);
            audio.volume = type === 'hover' ? 0.2 : 0.5;
            // Catch error để không crash nếu trình duyệt chặn autoplay hoặc file không tồn tại
            audio.play().catch((e) => console.warn("Audio play blocked/failed:", e)); 
        } catch (err) {
            // Im lặng bỏ qua lỗi
        }
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="w-full h-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 place-content-center">
            {data.map((phong) => {
                const Icon = phong.icon;
                const coQuyen = kiemTraQuyen(nguoiDung, phong.quyenTruyCap);

                return (
                    <div 
                        key={phong.id} 
                        onMouseEnter={() => playSound('hover')}
                        
                        className={`
                            relative group w-full h-full min-h-[120px] md:min-h-[160px] p-4 md:p-6
                            flex flex-col items-center justify-center text-center gap-2 md:gap-3
                            bg-black/60 backdrop-blur-md border border-[#C69C6D]/20
                            rounded-xl shadow-lg transition-all duration-300
                            ${coQuyen 
                                ? 'cursor-pointer hover:bg-[#C69C6D]/10 hover:border-[#C69C6D] hover:shadow-[0_0_20px_rgba(198,156,109,0.3)] hover:-translate-y-1' 
                                : 'opacity-40 grayscale cursor-not-allowed border-white/5'
                            }
                        `}
                    >
                        {coQuyen && (
                            <>
                                {onMoModal ? (
                                    <div onClick={(e) => { e.stopPropagation(); playSound('click'); onMoModal(phong.id); }} className="absolute inset-0 z-20 w-full h-full bg-transparent" />
                                ) : (
                                    <Link href={phong.duongDan} onClick={(e) => { playSound('click'); onDongModal(); }} className="absolute inset-0 z-10" />
                                )}
                            </>
                        )}

                        <div className={`
                            w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full
                            bg-gradient-to-b from-[#2a1e1b] to-black border border-[#C69C6D]/30 shadow-inner
                            ${coQuyen ? 'group-hover:scale-110 group-hover:border-[#C69C6D]' : ''}
                            transition-all duration-500
                        `}>
                            <Icon 
                                size={20} 
                                className={`md:w-7 md:h-7 ${coQuyen ? 'text-[#C69C6D]' : 'text-gray-500'} transition-colors`} 
                                strokeWidth={1.5}
                            />
                        </div>

                        <div className="flex flex-col gap-0.5 w-full">
                            <h3 className={`
                                font-sans font-bold text-xs md:text-sm uppercase tracking-wider leading-tight whitespace-normal
                                ${coQuyen ? 'text-[#E8D4B9] group-hover:text-white' : 'text-gray-500'}
                                transition-colors duration-300 line-clamp-2
                            `}>
                                {phong.ten}
                            </h3>
                            
                            {coQuyen && (
                                <div className="w-6 h-[1px] bg-[#C69C6D]/30 mx-auto group-hover:w-12 group-hover:bg-[#C69C6D] transition-all duration-500 my-1" />
                            )}
                        </div>

                        <div className={`absolute top-2 right-2 opacity-50 ${coQuyen ? 'group-hover:opacity-100 text-[#C69C6D]' : 'text-gray-600'}`}>
                            {coQuyen ? <ChevronRight size={12} /> : <Lock size={12} />}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
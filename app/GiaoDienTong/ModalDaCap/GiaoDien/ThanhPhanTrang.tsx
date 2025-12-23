'use client';
import React from 'react';
import NutToiLui from '../../MenuDuoi/GiaoDien/NutToiLui'; // Tái sử dụng nút cũ

interface Props {
    trangHienTai: number;
    tongSoTrang: number;
    onToi: () => void;
    onLui: () => void;
}

export default function ThanhPhanTrang({ trangHienTai, tongSoTrang, onToi, onLui }: Props) {
    // Tính toán vị trí bottom để nằm ngay trên Menu Dưới (Menu cao khoảng 70-90px)
    // Dùng bottom-[clamp(75px,...)] để an toàn
    return (
        <div className="fixed bottom-[clamp(75px,16vw,95px)] left-0 right-0 z-[2001] flex justify-center pointer-events-none">
            
            {/* Container chính: Bo tròn, Nền tối mờ, Đổ bóng */}
            <div className="pointer-events-auto flex items-center bg-[#110d0c]/90 backdrop-blur-md border border-[#8B5E3C]/40 rounded-full shadow-[0_5px_20px_rgba(0,0,0,0.8)] px-2 py-1 gap-2 h-[50px]">
                
                {/* Nút Lui */}
                <div className="h-full scale-75 origin-center">
                    <NutToiLui direction="left" onClick={onLui} />
                </div>

                {/* Phần hiển thị số trang */}
                <div className="px-4 flex flex-col items-center justify-center min-w-[80px]">
                    <span className="text-[10px] text-[#8B5E3C] uppercase font-bold tracking-widest">TRANG</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-[#F5E6D3]">{trangHienTai}</span>
                        <span className="text-sm text-[#5D4037] font-bold">/</span>
                        <span className="text-sm text-[#5D4037] font-bold">{tongSoTrang}</span>
                    </div>
                </div>

                {/* Nút Tới */}
                <div className="h-full scale-75 origin-center">
                    <NutToiLui direction="right" onClick={onToi} />
                </div>

            </div>
        </div>
    );
}
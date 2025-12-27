'use client';
import React from 'react';
import { Bell, ShoppingCart, QrCode } from 'lucide-react';

export default function MenuTren({ nguoiDung, loiChao }: { nguoiDung: any, loiChao: string }) {
    if (!nguoiDung) return null;

    return (
        // 🟢 CẬP NHẬT: NỀN TRONG SUỐT HOÀN TOÀN
        // Xóa bg-[#0a0807]/90, backdrop-blur-md, shadow-lg, border-b
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[85px] px-5 flex justify-between items-center bg-transparent transition-all duration-300">
            
            {/* Góc trái: Dòng chào mừng */}
            <div className="flex items-center gap-2 max-w-[70%] animate-slide-down">
                <span className="text-xs md:text-sm font-medium italic text-gray-300 drop-shadow-md whitespace-nowrap hidden sm:inline-block">
                    {loiChao},
                </span>
                <span className="font-black text-white uppercase tracking-wider drop-shadow-lg shadow-black truncate" 
                      style={{ fontSize: 'clamp(14px, 4vw, 20px)' }}>
                    {nguoiDung.ho_ten}
                </span>
            </div>

            {/* Góc phải */}
            <div className="flex gap-2 md:gap-3 animate-slide-down delay-100 shrink-0">
                <NutVuong icon={Bell} badge={3} />
                <NutVuong icon={ShoppingCart} />
                <NutVuong icon={QrCode} />
            </div>
        </div>
    );
}

function NutVuong({ icon: Icon, badge }: any) {
    return (
        <button className="w-9 h-9 md:w-10 md:h-10 bg-black/40 border border-white/10 rounded-lg flex items-center justify-center relative active:scale-95 transition-all hover:bg-white/10 backdrop-blur-sm">
            <Icon size={18} className="text-white" />
            {badge && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-black">
                    {badge}
                </span>
            )}
        </button>
    );
}
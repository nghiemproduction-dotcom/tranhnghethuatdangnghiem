'use client';
import React, { useState } from 'react';
import { Trophy, Package, Sparkles, Crown, Medal, X } from 'lucide-react'; 
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import GenericModule from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/GenericModule'; 

const Level2_Any = GenericModule as any;

interface Props {
    nhanSuId: string;
    totalKhach: number;
    totalViec: number; // Mới
    totalMau: number;  // Mới
}

const GamerBadge = ({ title, count, icon: Icon, colorHex, onClick, isLocked = false }: any) => (
    <div 
        onClick={!isLocked ? onClick : undefined}
        className={`
            relative group cursor-pointer select-none
            flex flex-col items-center justify-between
            w-full aspect-[4/3] max-w-[180px] p-3
            bg-[#0F0C0B] border border-[#8B5E3C]/20 rounded-xl
            transition-all duration-200 
            ${!isLocked ? 'hover:-translate-y-1 hover:border-opacity-100 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]' : 'opacity-50 grayscale cursor-not-allowed'}
        `}
        style={{ borderColor: !isLocked ? `${colorHex}40` : undefined }}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
        <div className="z-10 text-[10px] uppercase font-bold tracking-tighter text-[#8B5E3C] group-hover:text-[#C69C6D]">
            {title}
        </div>
        <div className="z-10 my-1 relative">
            <Icon size={32} style={{ color: colorHex }} className="drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]" />
            {!isLocked && count > 0 && (
                <div className="absolute -top-1 -right-2 bg-white text-black text-[9px] font-black px-1 rounded-sm border border-black shadow-sm">
                    {count}
                </div>
            )}
        </div>
        <div className="z-10 text-lg font-black italic tracking-tighter" style={{ color: colorHex }}>
            {isLocked ? 'LOCKED' : count}
        </div>
    </div>
);

export default function Tab_ThanhTich({ nhanSuId, totalKhach, totalViec, totalMau }: Props) {
    const [openingModule, setOpeningModule] = useState<{config: ModuleConfig, filter: any} | null>(null);

    const openModule = (table: string, title: string) => {
        setOpeningModule({
            config: {
                id: `view_${table}_${nhanSuId}`,
                tenModule: title,
                bangDuLieu: table,
                danhSachCot: [], 
                version: '1.0', updatedAt: ''
            },
            filter: { nguoi_tao: nhanSuId } // Filter theo người tạo
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
                <GamerBadge 
                    title="Khách Hàng"
                    count={totalKhach}
                    icon={Trophy}
                    colorHex="#FFD700" 
                    onClick={() => openModule('khach_hang', 'Khách Hàng Của Tôi')}
                />
                <GamerBadge 
                    title="Việc Đã Tạo"
                    count={totalViec}
                    icon={Sparkles}
                    colorHex="#00E5FF" 
                    onClick={() => openModule('viec_mau', 'Việc Mẫu Đã Đóng Góp')}
                />
                <GamerBadge 
                    title="Mẫu Sản Phẩm"
                    count={totalMau}
                    icon={Package}
                    colorHex="#FF9100" 
                    onClick={() => openModule('mau_san_pham', 'Mẫu Sản Phẩm Đã Tạo')}
                />
                <GamerBadge 
                    title="Hoàn Thành KPI"
                    count="85%" 
                    icon={Medal}
                    colorHex="#FF1744" 
                />
                <GamerBadge 
                    title="Top Doanh Số"
                    count="---" 
                    icon={Crown}
                    colorHex="#D500F9" 
                    isLocked={true} 
                />
            </div>

            {openingModule && (
                <div className="fixed inset-0 z-[3500] bg-black/95 backdrop-blur-md flex flex-col">
                    <div className="flex justify-end p-2">
                        <button onClick={() => setOpeningModule(null)} className="p-2 text-white hover:bg-white/10 rounded-full">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <GenericModule mode="level2"
                            isOpen={true}
                            onClose={() => setOpeningModule(null)} 
                            config={openingModule.config}
                            extraFilter={openingModule.filter}
                            isEmbedded={false} 
                            isModalView={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
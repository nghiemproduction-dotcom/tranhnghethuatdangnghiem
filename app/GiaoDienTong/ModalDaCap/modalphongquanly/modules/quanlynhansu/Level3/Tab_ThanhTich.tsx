'use client';
import React, { useState } from 'react';
import { Trophy, Package, Sparkles, Crown, Medal } from 'lucide-react'; 
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import Level2_Generic from '../Level2/Level2'; 

// Ép kiểu để tránh lỗi TS
const Level2_Any = Level2_Generic as any;

interface Props {
    nhanSuId: string;
    totalKhach: number;
}

// COMPONENT HUY HIỆU GAMER
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
        style={{ 
            borderColor: !isLocked ? `${colorHex}40` : undefined,
            boxShadow: !isLocked ? `inset 0 0 20px ${colorHex}10` : undefined
        }}
    >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />

        <div className="relative z-10 mt-2">
            <div 
                className="p-2.5 rounded-full border shadow-lg transition-transform group-hover:scale-110 duration-300"
                style={{ backgroundColor: `${colorHex}15`, borderColor: `${colorHex}60`, color: colorHex }}
            >
                <Icon size={20} strokeWidth={2} />
            </div>
            {!isLocked && (
                <Sparkles 
                    size={12} 
                    className="absolute -top-1 -right-2 animate-pulse text-yellow-200" 
                    style={{ color: colorHex }}
                />
            )}
        </div>

        <div className="z-10 flex flex-col items-center">
            <span 
                className="text-2xl font-black font-mono leading-none drop-shadow-md"
                style={{ color: isLocked ? '#555' : '#F5E6D3' }}
            >
                {count}
            </span>
        </div>

        <div className="z-10 w-full text-center border-t border-white/5 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E3C] truncate group-hover:text-[#C69C6D] transition-colors">
                {title}
            </p>
        </div>
    </div>
);

export default function Tab_ThanhTich({ nhanSuId, totalKhach }: Props) {
    
    const [openingModule, setOpeningModule] = useState<{
        config: ModuleConfig,
        filter: Record<string, any>
    } | null>(null);

    const openKhachHang = () => {
        setOpeningModule({
            config: {
                id: 'module_khach_hang_full',
                tenModule: 'Quản Lý Khách Hàng',
                bangDuLieu: 'khach_hang',
                danhSachCot: [], 
                version: '1.0', updatedAt: ''
            },
            filter: { sale_id: nhanSuId } 
        });
    };

    const openSanPham = () => {
        setOpeningModule({
            config: {
                id: 'module_mau_san_pham_full',
                tenModule: 'Mẫu Sản Phẩm',
                bangDuLieu: 'mau_san_pham',
                danhSachCot: [],
                version: '1.0', updatedAt: ''
            },
            filter: { nguoi_tao_id: nhanSuId }
        });
    };

    return (
        <div className="h-full flex flex-col p-2">
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center content-start">
                <GamerBadge 
                    title="Khách Hàng"
                    count={totalKhach || 0}
                    icon={Trophy}
                    colorHex="#FFD700" 
                    onClick={openKhachHang}
                />
                <GamerBadge 
                    title="Sản Phẩm"
                    count={0} 
                    icon={Package}
                    colorHex="#00E5FF" 
                    onClick={() => alert("Chức năng đang cập nhật")}
                />
                <GamerBadge 
                    title="Top Doanh Số"
                    count="---" 
                    icon={Crown}
                    colorHex="#D500F9" 
                    isLocked={true} 
                />
                <GamerBadge 
                    title="Hoàn Thành KPI"
                    count="85%" 
                    icon={Medal}
                    colorHex="#FF1744" 
                    onClick={() => {}}
                />
            </div>

            {/* 🟢 MODAL LEVEL 2: FULL MÀN HÌNH */}
            {openingModule && (
                <div className="fixed inset-0 z-[3500] bg-black/95 backdrop-blur-md animate-in fade-in duration-200 flex flex-col">
                    
                    {/* BỎ Header tự chế đi. 
                       Để Level 2 tự render ThanhDieuHuong (Header) của nó.
                    */}

                    <div className="flex-1 overflow-hidden relative">
                        <Level2_Any 
                            isOpen={true}
                            
                            // 🟢 QUAN TRỌNG: Truyền hàm đóng State để nút "Quay Lại" hoạt động
                            onClose={() => setOpeningModule(null)} 
                            
                            config={openingModule.config}
                            extraFilter={openingModule.filter}
                            
                            // 🟢 isEmbedded={false} để Level 2 tự hiểu là nó cần hiện Header và Nút chức năng đầy đủ
                            isEmbedded={false} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
'use client';
import React from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
    // Nhóm Phân Trang (Chỉ hiện khi cần)
    hienThiPhanTrang: boolean;
    trangHienTai: number;
    tongSoTrang: number;
    onTrangTruoc: () => void;
    onTrangSau: () => void;

    // Nhóm Điều Hướng Lịch Sử (To, Nổi bật)
    onLuiLichSu: () => void;
    onToiLichSu: () => void;
}

export default function ThanhDieuKhien({ 
    hienThiPhanTrang, 
    trangHienTai, 
    tongSoTrang, 
    onTrangTruoc, 
    onTrangSau, 
    onLuiLichSu, 
    onToiLichSu 
}: Props) {
    
    // Style: Không nền, không viền, hiệu ứng Glow & Scale
    const styleNutLon = "p-3 text-[#8B5E3C] transition-all duration-300 hover:text-[#C69C6D] hover:scale-125 hover:drop-shadow-[0_0_15px_rgba(198,156,109,0.8)] active:scale-95 cursor-pointer";
    const styleNutNho = "p-1 text-[#5D4037] transition-all duration-200 hover:text-[#F5E6D3] hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer";

    return (
        // Fixed vị trí: Nằm trên Menu Dưới - Tránh gradient che nút
        <div className="fixed bottom-[clamp(90px,18vw,110px)] left-0 right-0 z-[2001] flex items-center justify-center pointer-events-none">
            
            <div className="pointer-events-auto flex items-center gap-6 md:gap-12 px-6 py-2 rounded-full backdrop-blur-[2px]">
                
                {/* 1. NÚT LUI LỊCH SỬ (Giống trình duyệt) */}
                <button onClick={onLuiLichSu} className={styleNutLon} title="Quay lại">
                    <ArrowLeft size={36} strokeWidth={2.5} />
                </button>

                {/* 2. CỤM PHÂN TRANG (Chỉ hiển thị khi có nhiều hơn 1 trang) */}
                {hienThiPhanTrang && tongSoTrang > 1 && (
                    <div className="flex items-center gap-4 select-none animate-in fade-in zoom-in duration-300">
                        {/* Nút Previous Page */}
                        <button onClick={onTrangTruoc} disabled={trangHienTai <= 1} className={styleNutNho}>
                            <ChevronLeft size={24} strokeWidth={3} />
                        </button>

                        {/* Số trang dạng phân số tối giản */}
                        <div className="flex items-baseline gap-1 font-mono font-bold">
                            <span className="text-[#F5E6D3] text-xl drop-shadow-md">{trangHienTai}</span>
                            <span className="text-[#5D4037] text-sm">/</span>
                            <span className="text-[#8B5E3C] text-sm">{tongSoTrang}</span>
                        </div>

                        {/* Nút Next Page */}
                        <button onClick={onTrangSau} disabled={trangHienTai >= tongSoTrang} className={styleNutNho}>
                            <ChevronRight size={24} strokeWidth={3} />
                        </button>
                    </div>
                )}

                {/* 3. NÚT TỚI LỊCH SỬ */}
                <button onClick={onToiLichSu} className={styleNutLon} title="Đi tiếp">
                    <ArrowRight size={36} strokeWidth={2.5} />
                </button>

            </div>
        </div>
    );
}
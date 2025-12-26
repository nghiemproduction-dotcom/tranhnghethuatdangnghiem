'use client';
import React from 'react';

export interface TacVuModal {
    id: string;
    icon: any;
    nhan: string;
    onClick: () => void;
    mauSac?: string;
}

interface Props {
    danhSachTacVu: (TacVuModal | null)[];
    children?: React.ReactNode; 
}

export default function NutModal({ danhSachTacVu, children }: Props) {
    const validTasks = danhSachTacVu.filter((t): t is TacVuModal => t !== null);

    return (
        // Giữ nguyên vị trí ghim góc phải dưới
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 w-fit bg-transparent pointer-events-none p-2 z-[3000]">
            
            {/* Render nút con (NutDongBo) nếu có */}
            <div className="pointer-events-auto relative z-50">
                {children}
            </div>

            {/* Render danh sách nút thường */}
            {validTasks.map((tacVu) => (
                <div key={tacVu.id} className="relative group flex items-center justify-end pointer-events-auto z-40">
                    
                    {/* Tooltip: Căn chỉnh lại vị trí cho phù hợp nút nhỏ */}
                    <span className="absolute right-full mr-2 px-2 py-0.5 bg-[#1a120f] text-[#C69C6D] text-[10px] font-bold uppercase rounded border border-[#8B5E3C]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                        {tacVu.nhan}
                    </span>
                    
                    {/* Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            tacVu.onClick();
                        }}
                        // 🟢 CẬP NHẬT GIAO DIỆN:
                        // 1. w-7 h-7: Kích thước ~28px (Khoảng 60-70% so với cũ là 36px)
                        // 2. shadow-lg: Đổ bóng đậm để tạo cảm giác nổi khối (đục)
                        // 3. active:scale-90: Hiệu ứng nhấn rõ hơn
                        className={`w-7 h-7 rounded-full shadow-[0_3px_10px_rgba(0,0,0,1)] flex items-center justify-center transition-all duration-200 border border-transparent hover:scale-110 active:scale-90
                            ${tacVu.mauSac || 'bg-[#1a120f] text-[#C69C6D] hover:bg-[#C69C6D] hover:text-[#1a120f]'}
                        `}
                    >
                        {/* Thu nhỏ icon xuống size 14 cho cân đối với nút nhỏ */}
                        {React.createElement(tacVu.icon, { size: 14 })}
                    </button>
                </div>
            ))}
        </div>
    );
}
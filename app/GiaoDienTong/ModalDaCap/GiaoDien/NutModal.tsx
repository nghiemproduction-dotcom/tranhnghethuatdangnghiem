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
        // 🟢 FIX GIAO DIỆN:
        // 1. fixed: Ghim cứng vào màn hình
        // 2. bottom-6 right-6: Căn góc phải dưới (thay vì trôi nổi bên trái)
        // 3. z-[3000]: Đảm bảo nổi lên trên mọi modal/overlay khác
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 w-fit bg-transparent pointer-events-none p-2 z-[3000]">
            
            {/* 🟢 Render nút con (NutDongBo) */}
            <div className="pointer-events-auto relative z-50">
                {children}
            </div>

            {/* 🟢 Render danh sách nút thường */}
            {validTasks.map((tacVu) => (
                <div key={tacVu.id} className="relative group flex items-center justify-end pointer-events-auto z-40">
                    
                    {/* Tooltip */}
                    <span className="absolute right-full mr-3 px-2 py-1 bg-[#1a120f] text-[#C69C6D] text-[10px] font-bold uppercase rounded border border-[#8B5E3C]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {tacVu.nhan}
                    </span>
                    
                    {/* Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            tacVu.onClick();
                        }}
                        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 border hover:scale-110 active:scale-95
                            ${tacVu.mauSac || 'bg-[#1a120f] border-[#8B5E3C] text-[#C69C6D] hover:bg-[#C69C6D] hover:text-[#1a120f]'}
                        `}
                    >
                        {React.createElement(tacVu.icon, { size: 20 })}
                    </button>
                </div>
            ))}
        </div>
    );
}
'use client';
import React from 'react';

interface Props {
    children: React.ReactNode;
}

export default function ThanhMenuDuoi({ children }: Props) {
    // Không cần useRef hay handleScroll nữa vì nút điều hướng đã dời đi chỗ khác
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-[clamp(70px,15vw,90px)] z-[9999] bg-[#110d0c] shadow-[0_-5px_30px_rgba(0,0,0,0.9)] border-t border-[#3E2723] flex items-center px-1">
            
            {/* Chỉ còn vùng chứa Menu - CÂN GIỮA TUYỆT ĐỐI */}
            <div className="flex-1 flex overflow-x-auto px-2 no-scrollbar h-full">
                <div className="flex items-center gap-4 m-auto w-max min-w-full justify-center">
                    {children}
                </div>
            </div>

        </nav>
    );
}
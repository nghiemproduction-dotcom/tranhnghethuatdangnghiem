'use client';

import React from 'react';
import { Menu, Search } from 'lucide-react';

interface Props {
    onMenuToggle: () => void;
}

export default function ThanhHeaderMobile({ onMenuToggle }: Props) {
    return (
        // Header Mobile: Nền màu #131314 (Gemini Dark), bỏ border-bottom để liền mạch
        <header className="sticky top-0 w-full h-16 bg-[#131314] z-50 lg:hidden flex items-center justify-between px-4 transition-colors">
            
            {/* Cụm Bên Trái: Menu + Tiêu Đề */}
            <div className="flex items-center gap-3">
                {/* Nút Menu */}
                <button 
                    onClick={onMenuToggle} 
                    className="p-2 text-[#E3E3E3] hover:bg-white/10 rounded-full transition-colors"
                >
                    <Menu size={24} />
                </button>
                
                {/* Tiêu đề: Canh trái, font giống Gemini */}
                <h1 className="text-lg font-medium text-[#E3E3E3] tracking-tight truncate max-w-[200px] sm:max-w-xs">
                    Gemini
                    {/* Hoặc dùng tên dài nếu muốn: TRANH NGHỆ THUẬT ĐĂNG NGHIÊM */}
                </h1>
            </div>
            
            {/* Cụm Bên Phải: Nút Tìm kiếm (hoặc Avatar nếu muốn giống app thật) */}
            <div className="flex items-center">
                <button className="p-2 text-[#E3E3E3] hover:bg-white/10 rounded-full transition-colors">
                    <Search size={22} />
                </button>
                
                {/* Nếu muốn thêm Avatar bên phải cho giống app Gemini mobile thì bỏ comment dòng dưới */}
                {/* <div className="w-8 h-8 ml-2 rounded-full bg-blue-600 border border-white/10"></div> */}
            </div>
        </header>
    );
}
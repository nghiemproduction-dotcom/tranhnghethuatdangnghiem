'use client';

import React from 'react';
import { Search, Filter, Plus, RefreshCw } from 'lucide-react';

interface Props {
    onSearch: (term: string) => void;
    onFilter: (loai: string) => void;
    onAdd: () => void;
    onRefresh: () => void;
}

export default function MSP_Header({ onSearch, onFilter, onAdd, onRefresh }: Props) {
    return (
        <div className="h-16 border-b border-[#8B5E3C]/30 bg-[#110d0c] flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4 flex-1">
                {/* Search Box */}
                <div className="relative group max-w-md w-full">
                    <input 
                        type="text" 
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Tìm kiếm tên mẫu..." 
                        className="w-full bg-[#1a120f] border border-[#8B5E3C]/30 rounded-full pl-10 pr-4 py-2 text-sm text-[#F5E6D3] focus:border-[#C69C6D] outline-none transition-all placeholder-[#5D4037]"
                    />
                    <Search size={16} className="absolute left-3.5 top-2.5 text-[#5D4037] group-focus-within:text-[#C69C6D] transition-colors"/>
                </div>

                {/* Filter Button (Demo) */}
                <button className="p-2 text-[#8B5E3C] hover:text-[#C69C6D] hover:bg-[#C69C6D]/10 rounded-full transition-colors">
                    <Filter size={20}/>
                </button>
                
                <button onClick={onRefresh} className="p-2 text-[#8B5E3C] hover:text-[#C69C6D] hover:bg-[#C69C6D]/10 rounded-full transition-colors" title="Làm mới">
                    <RefreshCw size={20}/>
                </button>
            </div>

            {/* Add Button */}
            <button 
                onClick={onAdd}
                className="flex items-center gap-2 px-5 py-2 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold text-sm uppercase tracking-wide rounded-full shadow-[0_0_15px_rgba(198,156,109,0.3)] transition-all active:scale-95"
            >
                <Plus size={18} strokeWidth={2.5}/> Thêm Mới
            </button>
        </div>
    );
}
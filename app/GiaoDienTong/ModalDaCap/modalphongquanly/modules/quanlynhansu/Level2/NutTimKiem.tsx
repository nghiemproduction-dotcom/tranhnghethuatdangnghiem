'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { TacVuModal } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NutModal';

// 1. LOGIC TÌM KIẾM (Helper)
export const getSearchFilter = (tableName: string, keyword: string, columns: any[]) => {
    const term = `%${keyword.trim()}%`;
    if (tableName === 'nhan_su') {
        return `ten_day_du.ilike.${term},ho_ten.ilike.${term},ten_hien_thi.ilike.${term},so_dien_thoai.ilike.${term},email.ilike.${term},vi_tri.ilike.${term}`;
    }
    if (columns && columns.length > 0) {
        const textCols = columns.filter(c => c.kieuDuLieu === 'text' || !c.kieuDuLieu).map(c => `${c.key}.ilike.${term}`);
        if (textCols.length > 0) return textCols.join(',');
    }
    return `id.ilike.${term}`;
};

// 🟢 2. HOOK: useNutTimKiem
interface HookProps {
    onSearch: (keyword: string) => void;
    currentSearch: string;
}

export const useNutTimKiem = ({ onSearch, currentSearch }: HookProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Nút bấm
    const button: TacVuModal = {
        id: 'search', 
        icon: Search, 
        nhan: 'Tìm Kiếm',
        mauSac: currentSearch ? 'text-yellow-400 border-yellow-400' : undefined, 
        onClick: () => setIsOpen(true)
    };

    // Modal
    const modal = isOpen ? (
        <ModalTimKiem 
            isOpen={true} 
            onClose={() => setIsOpen(false)} 
            onSearch={onSearch} 
            currentSearch={currentSearch} 
        />
    ) : null;

    return { button, modal };
};

// 3. COMPONENT GIAO DIỆN
interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (keyword: string) => void;
    currentSearch?: string;
}

export default function ModalTimKiem({ isOpen, onClose, onSearch, currentSearch = '' }: Props) {
    const [keyword, setKeyword] = useState(currentSearch);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setKeyword(currentSearch);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, currentSearch]);

    const handleConfirm = () => { onSearch(keyword); onClose(); };
    const handleClear = () => { setKeyword(''); onSearch(''); inputRef.current?.focus(); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="w-full max-w-xl bg-[#1a120f] border border-[#8B5E3C] rounded-2xl shadow-2xl p-4 relative flex flex-col gap-4 animate-in zoom-in-95 duration-200 mx-4">
                <div className="flex justify-between items-center text-[#C69C6D] border-b border-[#8B5E3C]/20 pb-2">
                    <h3 className="font-bold uppercase text-sm flex items-center gap-2"><Search size={16}/> Tìm Kiếm Dữ Liệu</h3>
                    <button onClick={onClose} className="hover:text-white transition-colors"><X size={18}/></button>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B5E3C] group-focus-within:text-[#C69C6D] transition-colors" size={20} />
                    <input 
                        ref={inputRef} 
                        type="text" 
                        value={keyword} 
                        onChange={(e) => setKeyword(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()} 
                        placeholder="Nhập từ khóa..." 
                        className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-xl py-4 pl-12 pr-12 text-[#F5E6D3] placeholder:text-[#5D4037] focus:outline-none focus:border-[#C69C6D] focus:ring-1 focus:ring-[#C69C6D] transition-all text-lg font-medium shadow-inner" 
                    />
                    {keyword && <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5D4037] hover:text-[#C69C6D] p-1"><X size={16} /></button>}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 rounded-lg text-[#8B5E3C] hover:bg-[#8B5E3C]/10 font-bold text-xs uppercase transition-colors"
                    >
                        Đóng
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className="px-8 py-2 bg-[#C69C6D] text-[#1a120f] rounded-lg font-bold text-xs uppercase hover:bg-[#F5E6D3] shadow-lg shadow-[#C69C6D]/20 active:scale-95"
                    >
                        Tìm Kiếm
                    </button>
                </div>
            </div>
        </div>
    );
}
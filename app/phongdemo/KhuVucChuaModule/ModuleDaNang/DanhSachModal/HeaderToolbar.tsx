'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, X, Trash2, LayoutGrid, Table as TableIcon, Image as ImageIcon, ChevronLeft, Filter } from 'lucide-react';
import { CustomAction } from '../../KieuDuLieuModule';

interface Props {
    title: string;
    tableName: string;
    totalRecords: number;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    selectedCount: number;
    permissions: { canCreate: boolean; canDelete: boolean; canEdit: boolean };
    headerActions: CustomAction[];
    onClose: () => void;
    onCreateNew: () => void;
    onBulkDelete: () => void;
    onCustomAction: (action: CustomAction) => void;
    currentViewMode: 'table' | 'gallery' | 'kanban';
    onViewModeChange: (mode: 'table' | 'gallery' | 'kanban') => void;
}

export function HeaderToolbar({ 
    title, tableName, totalRecords, searchTerm, onSearchChange, 
    selectedCount, permissions, headerActions, 
    onClose, onCreateNew, onBulkDelete, onCustomAction,
    currentViewMode, onViewModeChange 
}: Props) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Tự động focus khi mở tìm kiếm
    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Xử lý đóng tìm kiếm nếu rỗng
    const handleBlur = () => {
        if (!searchTerm) setIsSearchOpen(false);
    };

    return (
        <div className="flex flex-col bg-[#181818] shrink-0 border-b border-white/5 relative overflow-hidden transition-all">
            
            {/* HÀNG TRÊN: Tiêu đề + Các nút (Khi không tìm kiếm) */}
            <div className={`flex items-center justify-between p-3 md:p-4 h-14 ${isSearchOpen ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 relative'}`}>
                
                <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={onClose} className="md:hidden -ml-1 text-gray-400 active:text-white"><ChevronLeft size={26}/></button>
                    <div className="flex flex-col">
                        <h3 className="text-white font-bold uppercase text-base md:text-xl tracking-tight truncate max-w-[180px] md:max-w-md">{title}</h3>
                        <p className="text-[10px] text-gray-500 font-mono hidden md:block">{totalRecords} records • {tableName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                    {/* Nút Mở Tìm Kiếm */}
                    <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                        <Search size={20} strokeWidth={1.5} />
                    </button>

                    {/* View Switcher (Ẩn trên mobile nhỏ nếu chật) */}
                    <div className="flex bg-[#0E0E0E] p-0.5 rounded-lg border border-white/10">
                        {[{ id: 'table', icon: TableIcon }, { id: 'gallery', icon: ImageIcon }, { id: 'kanban', icon: LayoutGrid }].map((mode: any) => (
                            <button key={mode.id} onClick={() => onViewModeChange(mode.id)} className={`p-1.5 rounded md:p-2 transition-all ${currentViewMode === mode.id ? 'bg-[#0068FF] text-white shadow' : 'text-gray-500'}`}>
                                <mode.icon size={16} strokeWidth={1.5}/>
                            </button>
                        ))}
                    </div>

                    {permissions.canCreate && (
                        <button onClick={onCreateNew} className="ml-1 bg-[#0068FF] hover:bg-blue-600 text-white p-2 md:px-4 md:py-2 rounded-lg md:rounded-full shadow-lg flex items-center gap-2">
                            <Plus size={20} strokeWidth={2}/> <span className="hidden md:inline font-bold text-xs">Mới</span>
                        </button>
                    )}
                    
                    <button onClick={onClose} className="hidden md:flex p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full"><X size={20}/></button>
                </div>
            </div>

            {/* HÀNG TÌM KIẾM (Chỉ hiện khi Active) */}
            <div className={`absolute inset-0 z-20 bg-[#181818] flex items-center px-2 gap-2 transition-transform duration-300 ${isSearchOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0068FF]"/>
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Nhập từ khóa tìm kiếm..." 
                        className="w-full bg-[#0E0E0E] border border-[#0068FF]/50 rounded-full py-2 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#0068FF]"
                        value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                        onBlur={handleBlur}
                    />
                    {searchTerm && (
                        <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14}/></button>
                    )}
                </div>
                <button onClick={() => { setIsSearchOpen(false); onSearchChange(''); }} className="text-sm font-medium text-gray-400 px-2">Hủy</button>
            </div>

            {/* Bulk Action Bar (Nổi lên khi chọn) */}
            {selectedCount > 0 && (
                <div className="absolute inset-0 z-30 bg-[#0068FF] flex items-center justify-between px-4 animate-in slide-in-from-top-full duration-200">
                    <span className="text-white font-bold text-sm">{selectedCount} đã chọn</span>
                    <div className="flex items-center gap-3">
                        {headerActions.map(act => (
                            <button key={act.id} onClick={() => onCustomAction(act)} className="text-white/80 hover:text-white text-xs font-bold uppercase">{act.label}</button>
                        ))}
                        {permissions.canDelete && (
                            <button onClick={onBulkDelete} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"><Trash2 size={18}/></button>
                        )}
                        <button onClick={() => {}} className="p-1"><X size={20} className="text-white/50 hover:text-white"/></button>
                    </div>
                </div>
            )}
        </div>
    );
}
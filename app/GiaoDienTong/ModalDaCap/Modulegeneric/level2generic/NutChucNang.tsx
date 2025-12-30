'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, LayoutGrid, List, SearchX, Kanban, ListFilter, Check, RefreshCw, Loader2 } from 'lucide-react'; 
import { ModuleConfig, CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { useNutTimKiem } from './NutTimKiem';

interface TacVuButton { 
    id: string; 
    icon: any; 
    nhan: string; 
    onClick: () => void; 
    mauSac?: string; 
}

interface Props { 
    config: ModuleConfig; 
    canAdd: boolean; 
    canConfig: boolean; 
    viewMode: 'table' | 'card' | 'kanban'; 
    onToggleView: () => void; 
    onAdd: () => void; 
    onRefresh: () => void; 
    onClose: () => void; 
    onSearchData: (keyword: string) => void; 
    currentSearch: string; 
    onSaveConfig: (newConfig: ModuleConfig) => void;
    
    // 🟢 Props Đồng bộ & Lọc
    onSync?: () => void;
    syncLabel?: string; // 🟢 Thêm dòng này để nhận tên nút riêng
    isSyncing?: boolean;
    groupByCol?: string;
    groupableColumns?: CotHienThi[];
    onSetGroupBy?: (colKey: string) => void;
}

export default function NutChucNang({ 
    config, canAdd, canConfig, viewMode, onToggleView, onAdd, onRefresh, onClose, onSearchData, currentSearch, onSaveConfig,
    onSync, syncLabel, isSyncing, groupByCol, groupableColumns, onSetGroupBy
}: Props) {

    const nutTimKiem = useNutTimKiem({ onSearch: onSearchData, currentSearch });
    const dangTimKiem = currentSearch && currentSearch.trim().length > 0;
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [filterRef]);

    let ViewIcon = List;
    let viewLabel = 'Xem Bảng';
    if (viewMode === 'table') { ViewIcon = LayoutGrid; viewLabel = 'Xem Thẻ'; }
    else if (viewMode === 'card') { ViewIcon = Kanban; viewLabel = 'Xem Kanban'; }
    else { ViewIcon = List; viewLabel = 'Xem Bảng'; }

    const danhSachTacVu: (TacVuButton | null)[] = [
        // 1. Thêm Mới
        canAdd ? { 
            id: 'add', icon: Plus, nhan: 'Thêm Mới', 
            mauSac: 'bg-green-700 text-white border-green-800 hover:bg-green-600', 
            onClick: onAdd 
        } : null,

        // 2. Đồng Bộ User (Hiển thị tên riêng dựa vào syncLabel)
        (onSync) ? {
            id: 'sync',
            icon: isSyncing ? Loader2 : RefreshCw,
            nhan: isSyncing ? 'Đang chạy...' : (syncLabel || 'Cấp User'), // 🟢 Ưu tiên hiển thị tên riêng
            mauSac: 'bg-blue-900/80 text-blue-200 border-blue-800 hover:bg-blue-700',
            onClick: isSyncing ? () => {} : onSync
        } : null,

        // 3. Lọc Nhóm
        (groupableColumns && groupableColumns.length > 0 && onSetGroupBy) ? {
            id: 'filter',
            icon: ListFilter,
            nhan: `Nhóm: ${groupByCol ? groupableColumns.find(c => c.key === groupByCol)?.label || groupByCol : 'Không'}`,
            mauSac: showFilterMenu ? 'bg-[#C69C6D] text-[#1a120f] border-[#C69C6D]' : 'bg-[#1a120f] text-[#C69C6D] border-[#8B5E3C] hover:bg-[#C69C6D] hover:text-[#1a120f]',
            onClick: () => setShowFilterMenu(!showFilterMenu)
        } : null,

        // 4. View Mode
        { 
            id: 'viewMode', icon: ViewIcon, nhan: viewLabel, onClick: onToggleView, 
            mauSac: 'bg-[#1a120f] text-[#C69C6D] border-[#8B5E3C] hover:bg-[#C69C6D] hover:text-[#1a120f]' 
        },

        // 5. Tìm kiếm
        dangTimKiem ? {
            id: 'clear_search', icon: SearchX, nhan: 'Hủy lọc',
            mauSac: 'bg-[#3E1A1A] text-red-400 border-red-900 hover:bg-red-700 hover:text-white',
            onClick: () => onSearchData('') 
        } : (nutTimKiem.button ? { 
            id: nutTimKiem.button.id, icon: nutTimKiem.button.icon, nhan: nutTimKiem.button.nhan, onClick: nutTimKiem.button.onClick, 
            mauSac: nutTimKiem.button.mauSac || 'bg-[#1a120f] text-[#C69C6D] border-[#8B5E3C] hover:bg-[#C69C6D] hover:text-[#1a120f]'
        } : null),
        
        // 6. Đóng
        { 
            id: 'close', icon: X, nhan: 'Đóng', 
            mauSac: 'bg-[#4a1a1a] text-red-500 border-red-900/50 hover:bg-red-600 hover:text-white', 
            onClick: onClose 
        }
    ];

    const validTasks = danhSachTacVu.filter((item): item is TacVuButton => item !== null);

    return (
        <div className="fixed bottom-32 right-4 flex flex-col items-end gap-3 z-[2500] pointer-events-none" ref={filterRef}>
            {/* Menu Lọc */}
            {showFilterMenu && groupableColumns && onSetGroupBy && (
                <div className="pointer-events-auto mb-2 bg-[#161210] border border-[#8B5E3C]/50 rounded-xl shadow-2xl overflow-hidden w-64 animate-in slide-in-from-right-10 fade-in duration-200">
                    <div className="px-4 py-2 bg-[#1a120f] border-b border-[#8B5E3C]/20 text-[10px] font-bold text-[#5D4037] uppercase flex justify-between items-center">
                        <span>Chọn cột phân loại</span>
                        <button onClick={() => setShowFilterMenu(false)}><X size={12} className="hover:text-white"/></button>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scroll p-1">
                        {groupableColumns.map(col => (
                            <button key={col.key} onClick={() => { onSetGroupBy(col.key); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between group transition-colors ${groupByCol === col.key ? 'bg-[#C69C6D]/20 text-[#C69C6D] border border-[#C69C6D]/30' : 'text-[#E8D4B9] hover:bg-[#2a2420] border border-transparent'}`}>
                                <span className="truncate">{col.label}</span>
                                {groupByCol === col.key && <Check size={14} className="text-[#C69C6D]"/>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {/* Các nút tròn */}
            {validTasks.map((tacVu) => (
                <div key={tacVu.id} className="pointer-events-auto relative group/secure flex items-center justify-end z-40">
                    <span className="absolute right-full mr-3 px-3 py-1 bg-[#0a0807] text-[#C69C6D] text-[10px] font-bold uppercase rounded-md border border-[#8B5E3C]/30 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl backdrop-blur-md">{tacVu.nhan}</span>
                    <button onClick={(e) => { e.stopPropagation(); if (typeof tacVu.onClick === 'function') tacVu.onClick(); }} className={`w-10 h-10 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-200 border border-transparent hover:scale-110 active:scale-95 ${tacVu.mauSac} ${tacVu.id === 'add' ? 'w-12 h-12' : ''}`}>
                        {React.createElement(tacVu.icon, { size: tacVu.id === 'add' ? 20 : 16 })}
                    </button>
                </div>
            ))}
            <div className="pointer-events-auto">{nutTimKiem.modal}</div>
        </div>
    );
}
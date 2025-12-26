'use client';
import React from 'react';
import { Plus, X, LayoutGrid, List, SearchX, Kanban } from 'lucide-react'; 
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

import NutDongBo from './NutDongBo'; 
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
}

export default function NutChucNang({ 
    config, canAdd, canConfig, viewMode, onToggleView, onAdd, onRefresh, onClose, onSearchData, currentSearch, onSaveConfig
}: Props) {

    const nutTimKiem = useNutTimKiem({ onSearch: onSearchData, currentSearch });
    const dangTimKiem = currentSearch && currentSearch.trim().length > 0;

    // Logic icon View
    let ViewIcon = List;
    let viewLabel = 'Xem Bảng';
    if (viewMode === 'table') { ViewIcon = LayoutGrid; viewLabel = 'Xem Thẻ'; }
    else if (viewMode === 'card') { ViewIcon = Kanban; viewLabel = 'Xem Kanban'; }
    else { ViewIcon = List; viewLabel = 'Xem Bảng'; }

    const danhSachTacVu: (TacVuButton | null)[] = [
        canAdd ? { 
            id: 'add', 
            icon: Plus, 
            nhan: 'Thêm', 
            mauSac: 'bg-green-700 text-white border-green-800 hover:bg-green-600', 
            onClick: onAdd 
        } : null,

        { 
            id: 'viewMode', 
            icon: ViewIcon, 
            nhan: viewLabel, 
            onClick: onToggleView, 
            mauSac: 'bg-[#1a120f] text-[#C69C6D] border-[#8B5E3C] hover:bg-[#C69C6D] hover:text-[#1a120f]' 
        },

        dangTimKiem 
        ? {
            id: 'clear_search',
            icon: SearchX,
            nhan: 'Hủy lọc',
            mauSac: 'bg-[#3E1A1A] text-red-400 border-red-900 hover:bg-red-700 hover:text-white',
            onClick: () => onSearchData('') 
        }
        : (nutTimKiem.button ? { 
            id: nutTimKiem.button.id, 
            icon: nutTimKiem.button.icon, 
            nhan: nutTimKiem.button.nhan, 
            onClick: nutTimKiem.button.onClick, 
            mauSac: nutTimKiem.button.mauSac || 'bg-[#1a120f] text-[#C69C6D] border-[#8B5E3C] hover:bg-[#C69C6D] hover:text-[#1a120f]'
        } : null),
        
        { 
            id: 'close', 
            icon: X, 
            nhan: 'Đóng', 
            mauSac: 'bg-[#4a1a1a] text-red-500 border-red-900/50 hover:bg-red-600 hover:text-white', 
            onClick: onClose 
        }
    ];

    const validTasks = danhSachTacVu.filter((item): item is TacVuButton => item !== null);

    return (
        <div className="fixed bottom-24 right-4 flex flex-col items-end gap-3 z-[2500] pointer-events-none">
            
            <div className="pointer-events-auto relative group flex items-center justify-end z-50">
                <NutDongBo config={config} onSuccess={onRefresh} />
            </div>

            {validTasks.map((tacVu) => {
                return (
                    <div key={tacVu.id} className="pointer-events-auto relative group/secure flex items-center justify-end z-40">
                        <span className="absolute right-full mr-2 px-2 py-0.5 bg-[#1a120f] text-[#C69C6D] text-[10px] font-bold uppercase rounded border border-[#8B5E3C]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                            {tacVu.nhan}
                        </span>
                        
                        <button 
                            // 🟢 FIX LỖI CRASH: Kiểm tra tacVu.onClick có tồn tại trước khi gọi
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (typeof tacVu.onClick === 'function') {
                                    tacVu.onClick(); 
                                }
                            }} 
                            className={`w-7 h-7 rounded-full shadow-[0_3px_10px_rgba(0,0,0,1)] flex items-center justify-center transition-all duration-200 border border-transparent hover:scale-110 active:scale-90 
                                ${tacVu.mauSac}
                            `}
                        >
                            {React.createElement(tacVu.icon, { size: 14 })}
                        </button>
                    </div>
                );
            })}
            
            <div className="pointer-events-auto">{nutTimKiem.modal}</div>
        </div>
    );
}
'use client';
import React from 'react';
import { Plus, RefreshCw, X, Settings, LayoutGrid, List } from 'lucide-react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

import NutDongBo from './NutDongBo'; 
import { useNutTimKiem } from './NutTimKiem';
import { useSecurity } from '@/app/HeThongPhanQuyen'; 

interface TacVuButton { id: string; icon: any; nhan: string; onClick: () => void; mauSac?: string; }
interface Props { config: ModuleConfig; canAdd: boolean; canConfig: boolean; viewMode: 'table' | 'card'; onToggleView: () => void; onAdd: () => void; onRefresh: () => void; onClose: () => void; onSearchData: (keyword: string) => void; currentSearch: string; onSaveConfig: (newConfig: ModuleConfig) => void; }

export default function NutChucNang({ 
    config, canAdd, canConfig, viewMode, onToggleView, onAdd, onRefresh, onClose, onSearchData, currentSearch, onSaveConfig
}: Props) {

    const nutTimKiem = useNutTimKiem({ onSearch: onSearchData, currentSearch });
    const { openConfig, isAdmin } = useSecurity();

    const danhSachTacVu: (TacVuButton | null)[] = [
        canAdd ? { id: 'add', icon: Plus, nhan: 'Thêm Mới', mauSac: 'text-green-500 border-green-500 hover:bg-green-500 hover:text-white', onClick: onAdd } : null,
        { id: 'viewMode', icon: viewMode === 'card' ? List : LayoutGrid, nhan: viewMode === 'card' ? 'Xem Bảng' : 'Xem Thẻ', onClick: onToggleView, mauSac: 'text-[#C69C6D] border-[#C69C6D] hover:bg-[#C69C6D] hover:text-[#1a120f]' },
        nutTimKiem.button ? { id: nutTimKiem.button.id, icon: nutTimKiem.button.icon, nhan: nutTimKiem.button.nhan, onClick: nutTimKiem.button.onClick, mauSac: nutTimKiem.button.mauSac } : null,
        { id: 'refresh', icon: RefreshCw, nhan: 'Làm Mới', onClick: onRefresh },
        isAdmin ? { id: 'security_config', icon: Settings, nhan: 'Phân Quyền Tổng', onClick: () => openConfig('module_root', 'Toàn Bộ Module', config, onSaveConfig) } : null,
        { id: 'close', icon: X, nhan: 'Đóng', mauSac: 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white', onClick: onClose }
    ];

    const validTasks = danhSachTacVu.filter((item): item is TacVuButton => item !== null);

    return (
        // 🟢 CONTAINER CHÍNH: Fixed, không chặn click (pointer-events-none)
        <div className="fixed bottom-24 right-4 flex flex-col items-end gap-4 z-[2500] pointer-events-none">
            
            {/* Nút Đồng Bộ */}
            <div className="pointer-events-auto relative group flex items-center justify-end z-50">
                <span className="absolute right-full mr-3 px-2 py-1 bg-[#1a120f] text-[#C69C6D] text-[10px] font-bold uppercase rounded border border-[#8B5E3C]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Đồng bộ User</span>
                <NutDongBo config={config} onSuccess={onRefresh} />
            </div>

            {/* Các nút thường */}
            {validTasks.map((tacVu) => (
                <div key={tacVu.id} className="pointer-events-auto relative group flex items-center justify-end z-40">
                    <span className="absolute right-full mr-3 px-2 py-1 bg-[#1a120f] text-[#C69C6D] text-[10px] font-bold uppercase rounded border border-[#8B5E3C]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{tacVu.nhan}</span>
                    <button onClick={(e) => { e.stopPropagation(); tacVu.onClick(); }} className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 border hover:scale-110 active:scale-95 ${tacVu.mauSac || 'bg-[#1a120f] border-[#8B5E3C] text-[#C69C6D] hover:bg-[#C69C6D] hover:text-[#1a120f]'}`}>
                        {React.createElement(tacVu.icon, { size: 20 })}
                    </button>
                </div>
            ))}
            
            <div className="pointer-events-auto">{nutTimKiem.modal}</div>
        </div>
    );
}
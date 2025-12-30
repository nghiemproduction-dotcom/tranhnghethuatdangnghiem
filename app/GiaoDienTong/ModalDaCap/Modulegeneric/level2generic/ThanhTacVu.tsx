import React from 'react';
import NutChucNang from './NutChucNang';
import { ModuleConfig, CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { SyncConfig } from './CauHinhDongBo';

interface Props {
    config: ModuleConfig;
    canAdd: boolean;
    canConfig: boolean;
    viewMode: any;
    onToggleView: () => void;
    onAdd: () => void;
    onRefresh: () => void;
    onClose: () => void;
    onSearch: (k: string) => void;
    search: string;
    
    syncConfig: SyncConfig;
    isSyncing: boolean;
    onSync: () => void;
    
    groupByCol: string;
    columns: CotHienThi[];
    onSetGroupBy: (col: string) => void;

    // 🟢 MỚI: Thêm props cho Tabs
    tabs?: string[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export default function ThanhTacVu({ 
    config, canAdd, canConfig, viewMode, onToggleView, onAdd, onRefresh, onClose, onSearch, search, 
    syncConfig, isSyncing, onSync, groupByCol, columns, onSetGroupBy,
    tabs = [], activeTab = 'ALL', onTabChange 
}: Props) {
    
    const groupableColumns = columns.filter(c => ['select', 'text', 'radio'].includes(c.kieuDuLieu) || ['trang_thai', 'loai', 'vi_tri', 'chuc_vu', 'role'].includes(c.key));

    return (
        <div className="flex flex-col gap-3 w-full">
            <NutChucNang 
                config={config} canAdd={canAdd} canConfig={canConfig} 
                viewMode={viewMode} onToggleView={onToggleView} 
                onAdd={onAdd} onRefresh={onRefresh} onClose={onClose} 
                onSearchData={onSearch} currentSearch={search} 
                onSaveConfig={async () => {}} 
                
                onSync={syncConfig.visible ? onSync : undefined}
                syncLabel={syncConfig.label}
                isSyncing={isSyncing}

                groupByCol={groupByCol}
                groupableColumns={groupableColumns}
                onSetGroupBy={onSetGroupBy}
            />

            {/* 🟢 HIỂN THỊ TABS NẾU CÓ DỮ LIỆU GROUP */}
            {tabs && tabs.length > 0 && onTabChange && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    <button
                        onClick={() => onTabChange('ALL')}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                            activeTab === 'ALL' 
                            ? 'bg-[#C69C6D] text-[#1a120f]' 
                            : 'bg-[#1a120f] border border-[#8B5E3C]/30 text-[#8B5E3C] hover:text-[#E8D4B9]'
                        }`}
                    >
                        Tất cả
                    </button>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                                activeTab === tab 
                                ? 'bg-[#C69C6D] text-[#1a120f]' 
                                : 'bg-[#1a120f] border border-[#8B5E3C]/30 text-[#8B5E3C] hover:text-[#E8D4B9]'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
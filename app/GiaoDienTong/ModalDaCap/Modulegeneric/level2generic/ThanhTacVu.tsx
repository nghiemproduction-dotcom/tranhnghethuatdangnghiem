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
}

export default function ThanhTacVu({ config, canAdd, canConfig, viewMode, onToggleView, onAdd, onRefresh, onClose, onSearch, search, syncConfig, isSyncing, onSync, groupByCol, columns, onSetGroupBy }: Props) {
    
    const groupableColumns = columns.filter(c => ['select', 'text', 'radio'].includes(c.kieuDuLieu) || ['trang_thai', 'loai', 'vi_tri', 'chuc_vu', 'role'].includes(c.key));

    return (
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
    );
}
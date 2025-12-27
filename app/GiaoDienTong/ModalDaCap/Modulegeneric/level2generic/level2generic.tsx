'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import ThanhPhanTrang from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhPhanTrang';
import Level3_FormChiTiet from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/level3generic/level3generic';

import { useDuLieu } from './useDuLieu';
import { layCauHinhDongBo } from './CauHinhDongBo';
import HeaderNhung from './HeaderNhung';
import KhungHienThi from './KhungHienThi';
import ThanhChon from './ThanhChon';
import ThanhTacVu from './ThanhTacVu';

interface Props {
    isOpen: boolean;
    onClose?: () => void; 
    config: ModuleConfig;
    onOpenDetail?: (item: any, config: ModuleConfig) => void;
    isEmbedded?: boolean;
    extraFilter?: Record<string, any>; 
}

export default function TrangChu({ isOpen, onClose, config, onOpenDetail, isEmbedded = false, extraFilter }: Props) {
    const { data, setData, loading, setLoading, search, setSearch, page, setPage, total, groupByCol, setGroupByCol, existingColumns, columns, fetchData, ITEMS_PER_PAGE } = useDuLieu(config, isOpen, extraFilter, isEmbedded);
    const syncConfig = layCauHinhDongBo(config);
    
    const [viewMode, setViewMode] = useState<'card' | 'kanban'>('card');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL');
    const [tabOptions, setTabOptions] = useState<string[]>([]);
    const [userRole, setUserRole] = useState('khach');
    const [isLevel3Open, setIsLevel3Open] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => { if (typeof window !== 'undefined') setUserRole(localStorage.getItem('USER_ROLE') || 'khach'); }, []);
    const canAdd = ['admin', 'quanly', 'boss'].includes(userRole);
    const canDelete = ['admin', 'boss'].includes(userRole);

    useEffect(() => {
        const loadTabs = async () => {
            if (groupByCol && existingColumns.includes(groupByCol)) {
                const { data } = await supabase.from(config.bangDuLieu).select(groupByCol).not(groupByCol, 'is', null);
                if (data) setTabOptions(Array.from(new Set(data.map((i: any) => i[groupByCol]))).sort() as string[]);
            }
        };
        loadTabs();
    }, [groupByCol, existingColumns]);

    const handleSync = async () => { if (!confirm(`Bạn muốn ${syncConfig.tooltip}?`)) return; setSyncing(true); try { const { error } = await supabase.rpc(syncConfig.rpcFunc); if (error) throw error; alert('Đồng bộ thành công!'); } catch (e: any) { alert(e.message); } finally { setSyncing(false); } };
    const handleDelete = async () => { if (!confirm(`Xóa ${selectedIds.length} mục?`)) return; setLoading(true); await supabase.from(config.bangDuLieu).delete().in('id', selectedIds); setLoading(false); setSelectedIds([]); fetchData(page, activeTab, search); };
    const handleDragEnd = async (e: any) => { /* logic drag end */ };
    const handleOpenLevel3 = (item: any) => { setSelectedItem(item); setIsLevel3Open(true); };

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const MainContent = (
        // 🟢 CẬP NHẬT LAYOUT: 
        // 1. h-full: Chiều cao full container
        // 2. pt-[85px] pb-[100px]: Tạo khoảng trống an toàn để nội dung Header/Footer của Level 2 không bị Menu chính che mất
        //    nhưng nền vẫn tràn viền.
        <div className={`flex flex-col h-full bg-transparent ${isEmbedded ? '' : 'animate-in fade-in duration-300'} pt-[85px] pb-[100px]`}>
            {isEmbedded && (
                <HeaderNhung 
                    search={search} onSearchChange={setSearch} onSearchEnter={() => { setPage(1); fetchData(1, activeTab, search); }}
                    canAdd={canAdd} onAdd={() => handleOpenLevel3(null)}
                    syncConfig={syncConfig} isSyncing={syncing} onSync={handleSync}
                />
            )}

            <div className={`flex-1 flex flex-col relative overflow-hidden bg-transparent ${isEmbedded ? 'rounded-b-xl' : ''}`}>
                <KhungHienThi 
                    loading={loading} data={data} viewMode={viewMode} columns={columns} groupByCol={groupByCol}
                    onRowClick={handleOpenLevel3} canEdit={true}
                    selectedIds={selectedIds} onSelect={(id) => setSelectedIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id])}
                    onDragEnd={handleDragEnd}
                />
                
                {totalPages > 1 && viewMode !== 'kanban' && (
                    <div className="shrink-0 border-t border-white/10 bg-transparent backdrop-blur-sm">
                        <ThanhPhanTrang trangHienTai={page} tongSoTrang={totalPages} onLui={() => page > 1 && fetchData(page - 1)} onToi={() => page < totalPages && fetchData(page + 1)} />
                    </div>
                )}
            </div>

            <ThanhChon count={selectedIds.length} canDelete={canDelete} onDelete={handleDelete} onCancel={() => setSelectedIds([])} />

            {!isEmbedded && !isLevel3Open && (
                <ThanhTacVu 
                    config={config} canAdd={canAdd} canConfig={userRole === 'admin'}
                    viewMode={viewMode} onToggleView={() => setViewMode(v => v === 'card' ? 'kanban' : 'card')}
                    onAdd={() => handleOpenLevel3(null)} onRefresh={() => fetchData(page)} onClose={onClose || (() => {})}
                    onSearch={(k) => { setSearch(k); setPage(1); fetchData(1, activeTab, k); }} search={search}
                    syncConfig={syncConfig} isSyncing={syncing} onSync={handleSync}
                    groupByCol={groupByCol} columns={columns} onSetGroupBy={setGroupByCol}
                />
            )}
        </div>
    );

    const Level3Modal = (
        <Level3_FormChiTiet isOpen={isLevel3Open} onClose={() => setIsLevel3Open(false)} onSuccess={() => fetchData(page, activeTab, search)} config={config} initialData={selectedItem} userRole={userRole} userEmail={typeof window !== 'undefined' ? localStorage.getItem('USER_EMAIL') || '' : ''} parentTitle={config.tenModule} />
    );

    if (isEmbedded) return <>{MainContent}{Level3Modal}</>;

    return (
        // 🟢 QUAN TRỌNG: Cấu trúc Full Screen
        // fixed inset-0: Tràn toàn bộ màn hình
        // z-[2000]: Nằm dưới Menu (9999) nhưng trên Dashboard (ẩn)
        // bg-transparent: Trong suốt hoàn toàn
        <>
            <div className="fixed inset-0 z-[2000] bg-transparent flex flex-col shadow-none animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
                {MainContent}
            </div>
            {Level3Modal}
        </>
    );
}
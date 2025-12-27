'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import ThanhPhanTrang from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhPhanTrang';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';
import Level3_FormChiTiet from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/level3generic/level3generic';

// Import các thành phần logic
import { useDuLieu } from './useDuLieu';
import { layCauHinhDongBo } from './CauHinhDongBo';
import HeaderNhung from './HeaderNhung';
// 🟢 Đã xóa import HeaderDayDu (Thanh điều hướng cũ)
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
    // 1. Hooks & Logic
    const { data, setData, loading, setLoading, search, setSearch, page, setPage, total, groupByCol, setGroupByCol, existingColumns, columns, fetchData, ITEMS_PER_PAGE } = useDuLieu(config, isOpen, extraFilter, isEmbedded);
    const syncConfig = layCauHinhDongBo(config);
    
    // 2. Local State
    const [viewMode, setViewMode] = useState<'card' | 'kanban'>('card');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL');
    const [tabOptions, setTabOptions] = useState<string[]>([]);
    
    const [userRole, setUserRole] = useState('khach');
    const [isLevel3Open, setIsLevel3Open] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // 3. Permissions
    useEffect(() => { if (typeof window !== 'undefined') setUserRole(localStorage.getItem('USER_ROLE') || 'khach'); }, []);
    const canAdd = ['admin', 'quanly', 'boss'].includes(userRole);
    const canDelete = ['admin', 'boss'].includes(userRole);

    // 4. Effects
    useEffect(() => {
        const loadTabs = async () => {
            if (groupByCol && existingColumns.includes(groupByCol)) {
                const { data } = await supabase.from(config.bangDuLieu).select(groupByCol).not(groupByCol, 'is', null);
                if (data) setTabOptions(Array.from(new Set(data.map((i: any) => i[groupByCol]))).sort() as string[]);
            }
        };
        loadTabs();
    }, [groupByCol, existingColumns]);

    // 5. Handlers
    const handleSync = async () => {
        if (!confirm(`Bạn muốn ${syncConfig.tooltip}?`)) return;
        setSyncing(true);
        try {
            const { error } = await supabase.rpc(syncConfig.rpcFunc);
            if (error) throw error;
            alert('Đồng bộ thành công!');
        } catch (e: any) { alert(e.message); } finally { setSyncing(false); }
    };

    const handleDelete = async () => {
        if (!confirm(`Xóa ${selectedIds.length} mục?`)) return;
        setLoading(true);
        await supabase.from(config.bangDuLieu).delete().in('id', selectedIds);
        setLoading(false); setSelectedIds([]); fetchData(page, activeTab, search);
    };

    const handleDragEnd = async (e: any) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const oldData = [...data];
        setData(prev => prev.map(r => r.id === active.id ? { ...r, [groupByCol]: over.id } : r));
        const { error } = await supabase.from(config.bangDuLieu).update({ [groupByCol]: over.id }).eq('id', active.id);
        if (error) setData(oldData);
    };

    const handleOpenLevel3 = (item: any) => { setSelectedItem(item); setIsLevel3Open(true); };
    const handleTabChange = (t: string) => { setActiveTab(t); setPage(1); fetchData(1, t, search); setSelectedIds([]); };

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const MainContent = (
        // 🟢 SỬA NỀN: bg-transparent thay vì bg-[#0F0C0B] để nhận hiệu ứng kính
        <div className={`flex flex-col h-full bg-transparent ${isEmbedded ? '' : 'animate-in slide-in-from-right-10 duration-300'}`}>
            
            {/* 🟢 XÓA HEADER ĐẦY ĐỦ (THANH ĐIỀU HƯỚNG) */}
            {isEmbedded && (
                <HeaderNhung 
                    search={search} onSearchChange={setSearch} onSearchEnter={() => { setPage(1); fetchData(1, activeTab, search); }}
                    canAdd={canAdd} onAdd={() => handleOpenLevel3(null)}
                    syncConfig={syncConfig} isSyncing={syncing} onSync={handleSync}
                />
            )}

            {/* 🟢 SỬA NỀN CONTAINER LIST: bg-transparent */}
            <div className={`flex-1 flex flex-col relative overflow-hidden bg-transparent ${isEmbedded ? 'rounded-b-xl' : ''}`}>
                <KhungHienThi 
                    loading={loading} data={data} viewMode={viewMode} columns={columns} groupByCol={groupByCol}
                    onRowClick={handleOpenLevel3} canEdit={true}
                    selectedIds={selectedIds} onSelect={(id) => setSelectedIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id])}
                    onDragEnd={handleDragEnd}
                />
                
                {totalPages > 1 && viewMode !== 'kanban' && (
                    <div className="shrink-0 border-t border-white/10 bg-black/20 backdrop-blur-sm">
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
        // 🟢 SỬA MODAL CONTAINER: bg-black/90 backdrop-blur-xl (Kính mờ)
        // bottom-0 để full màn hình (che MenuDuoi nếu cần, hoặc chừa ra tùy ý, ở đây tôi để full nhưng có z-index thấp hơn MenuDuoi)
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[2200] bg-black/90 backdrop-blur-xl flex flex-col shadow-2xl">
            <NoidungModal>{MainContent}</NoidungModal>
            {Level3Modal}
        </div>
    );
}
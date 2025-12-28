'use client';
import React, { useState, useEffect, useCallback } from 'react';
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

    // PHÁT SỰ KIỆN KHI LEVEL 3 MỞ -> ẨN PAGE
    useEffect(() => {
        const event = new CustomEvent('toggle-content-visibility', {
            detail: { id: `level2-${config.id}-level3`, open: isLevel3Open }
        });
        window.dispatchEvent(event);
    }, [isLevel3Open, config.id]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))) {
                e.preventDefault();
                const searchInput = document.getElementById('search-input-level2');
                if (searchInput) searchInput.focus();
            }
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                fetchData(page);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [page, fetchData]);

    useEffect(() => {
        const loadTabs = async () => {
            if (groupByCol && existingColumns.includes(groupByCol)) {
                const { data } = await supabase.from(config.bangDuLieu).select(groupByCol).not(groupByCol, 'is', null);
                if (data) setTabOptions(Array.from(new Set(data.map((i: any) => i[groupByCol]))).sort() as string[]);
            }
        };
        loadTabs();
    }, [groupByCol, existingColumns, config.bangDuLieu]);

    const handleSync = async () => { if (!confirm(`Bạn muốn ${syncConfig.tooltip}?`)) return; setSyncing(true); try { const { error } = await supabase.rpc(syncConfig.rpcFunc); if (error) throw error; alert('Đồng bộ thành công!'); } catch (e: any) { alert(e.message); } finally { setSyncing(false); } };
    
    const handleDelete = async () => { 
        if (!confirm(`Xóa vĩnh viễn ${selectedIds.length} mục đã chọn?`)) return; 
        setLoading(true); 
        await supabase.from(config.bangDuLieu).delete().in('id', selectedIds); 
        setLoading(false); 
        setSelectedIds([]); 
        fetchData(page, activeTab, search); 
    };

    const handleOpenLevel3 = (item: any) => { setSelectedItem(item); setIsLevel3Open(true); };

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const MainContent = (
        <div className={`relative w-full h-full bg-transparent ${isEmbedded ? '' : 'animate-in fade-in duration-300'}`}>
            <div className="absolute inset-0 z-10 overflow-y-auto custom-scroll">
                <div className={`min-h-full ${isEmbedded ? 'pt-[100px]' : 'pt-[110px]'} pb-[130px] px-2 md:px-6`}>
                    <KhungHienThi 
                        loading={loading} 
                        data={data} 
                        viewMode={viewMode} 
                        columns={columns} 
                        groupByCol={groupByCol}
                        onRowClick={handleOpenLevel3} 
                        canEdit={true}
                        selectedIds={selectedIds} 
                        onSelect={(id) => setSelectedIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id])}
                        onDragEnd={() => {}}
                    />
                </div>
            </div>

            {isEmbedded && (
                <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none pt-[85px]">
                    <div className="pointer-events-auto px-4"> 
                        <HeaderNhung 
                            search={search} onSearchChange={setSearch} onSearchEnter={() => { setPage(1); fetchData(1, activeTab, search); }}
                            canAdd={canAdd} onAdd={() => handleOpenLevel3(null)}
                            syncConfig={syncConfig} isSyncing={syncing} onSync={handleSync}
                        />
                    </div>
                </div>
            )}

            {!isEmbedded && !isLevel3Open && (
                <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center pointer-events-none gap-3 px-4">
                    {totalPages > 1 && viewMode !== 'kanban' && (
                        <div className="pointer-events-auto animate-in slide-in-from-bottom-4 duration-500">
                            <ThanhPhanTrang 
                                trangHienTai={page} 
                                tongSoTrang={totalPages} 
                                onLui={() => page > 1 && fetchData(page - 1)} 
                                onToi={() => page < totalPages && fetchData(page + 1)} 
                            />
                        </div>
                    )}
                    <div className="w-full max-w-4xl pointer-events-auto">
                        <ThanhTacVu 
                            config={config} 
                            canAdd={canAdd} 
                            canConfig={userRole === 'admin'}
                            viewMode={viewMode} 
                            onToggleView={() => setViewMode(v => v === 'card' ? 'kanban' : 'card')}
                            onAdd={() => handleOpenLevel3(null)} 
                            onRefresh={() => fetchData(page)} 
                            onClose={onClose || (() => {})}
                            onSearch={(k) => { setSearch(k); setPage(1); fetchData(1, activeTab, k); }} 
                            search={search}
                            syncConfig={syncConfig} 
                            isSyncing={syncing} 
                            onSync={handleSync}
                            groupByCol={groupByCol} 
                            columns={columns} 
                            onSetGroupBy={setGroupByCol}
                        />
                    </div>
                </div>
            )}

            <ThanhChon 
                count={selectedIds.length} 
                canDelete={canDelete} 
                onDelete={handleDelete} 
                onCancel={() => setSelectedIds([])} 
            />
        </div>
    );

    const Level3Modal = (
        <Level3_FormChiTiet 
            isOpen={isLevel3Open} 
            onClose={() => setIsLevel3Open(false)} 
            onSuccess={() => fetchData(page, activeTab, search)} 
            config={config} 
            initialData={selectedItem} 
            userRole={userRole} 
            userEmail={typeof window !== 'undefined' ? localStorage.getItem('USER_EMAIL') || '' : ''} 
            parentTitle={config.tenModule} 
        />
    );

    if (isEmbedded) return <>{MainContent}{Level3Modal}</>;

    return (
        // 🟢 CẬP NHẬT: NỀN ĐEN 80% (bg-black/80)
        <>
            <div className="fixed inset-0 z-[3500] bg-black/80 backdrop-blur-sm flex flex-col shadow-none animate-in fade-in zoom-in-95 duration-300 overflow-hidden pointer-events-none">
                <div className="w-full h-full pointer-events-auto flex flex-col">
                    <div className="flex-1 relative w-full h-[100dvh] overflow-hidden">
                        {MainContent}
                    </div>
                </div>
            </div>
            {Level3Modal}
        </>
    );
}
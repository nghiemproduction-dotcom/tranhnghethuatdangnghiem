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

    // Effect: Check Role
    useEffect(() => { if (typeof window !== 'undefined') setUserRole(localStorage.getItem('USER_ROLE') || 'khach'); }, []);
    const canAdd = ['admin', 'quanly', 'boss'].includes(userRole);
    const canDelete = ['admin', 'boss'].includes(userRole);

    // 🟢 SMART SHORTCUTS (Phím tắt thông minh)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl + K hoặc / : Focus tìm kiếm (Logic xử lý trong ThanhTacVu sẽ bắt event này nếu input có ref, ở đây ta set state để trigger)
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))) {
                e.preventDefault();
                const searchInput = document.getElementById('search-input-level2');
                if (searchInput) searchInput.focus();
            }
            // Ctrl + R : Refresh Data
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                fetchData(page);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [page, fetchData]);

    // Effect: Load Tabs Group By
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
        // 🟢 LAYOUT: Relative container 
        <div className={`relative w-full h-full bg-transparent ${isEmbedded ? '' : 'animate-in fade-in duration-300'}`}>
            
            {/* 1. VÙNG HIỂN THỊ DANH SÁCH (Trọng tâm) */}
            <div className="absolute inset-0 z-10 overflow-y-auto custom-scroll">
                {/* Responsive Padding:
                    - Top: Nếu Embedded (85px) để né HeaderNhung. Nếu Full (0px).
                    - Bottom: 140px để né ThanhTacVu và ThanhPhanTrang.
                */}
                <div className={`min-h-full ${isEmbedded ? 'pt-[90px]' : 'pt-4'} pb-[160px] px-2 md:px-6`}>
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
                        onDragEnd={() => {}} // Placeholder cho DnD
                    />
                </div>
            </div>

            {/* 2. HEADER NHÚNG (Chỉ hiện khi nhúng trong Grid) */}
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

            {/* 3. THANH TÁC VỤ & PHÂN TRANG (Floating Bottom) */}
            {!isEmbedded && !isLevel3Open && (
                // Dùng z-20 để nổi trên danh sách nhưng dưới Level 3
                <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center pointer-events-none gap-3 px-4">
                    
                    {/* Phân trang nổi (Glassmorphism) */}
                    {totalPages > 1 && viewMode !== 'kanban' && (
                        <div className="pointer-events-auto animate-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-[#0f0c0b]/80 backdrop-blur-md rounded-full px-1 border border-[#8B5E3C]/30 shadow-lg">
                                <ThanhPhanTrang 
                                    trangHienTai={page} 
                                    tongSoTrang={totalPages} 
                                    onLui={() => page > 1 && fetchData(page - 1)} 
                                    onToi={() => page < totalPages && fetchData(page + 1)} 
                                />
                            </div>
                        </div>
                    )}

                    {/* Thanh công cụ chính (Smart Bar) */}
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

            {/* Thanh chọn đa năng (Xuất hiện khi tick chọn row) */}
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
        // 🟢 Z-INDEX 3000: Nằm trên Dashboard (ẩn) nhưng dưới Level 3 (4000)
        <>
            <div className="fixed inset-0 z-[3000] bg-transparent flex flex-col shadow-none animate-in fade-in zoom-in-95 duration-300 overflow-hidden pointer-events-none">
                {/* Wrapper full màn hình */}
                <div className="w-full h-full pointer-events-auto">
                    {MainContent}
                </div>
            </div>
            {Level3Modal}
        </>
    );
}
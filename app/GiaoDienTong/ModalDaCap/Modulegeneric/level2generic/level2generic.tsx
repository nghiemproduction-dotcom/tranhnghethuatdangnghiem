'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig, CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import ThanhPhanTrang from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhPhanTrang';
import dynamic from 'next/dynamic';
const Level3_FormChiTiet = dynamic(() => import('@/app/GiaoDienTong/ModalDaCap/Modulegeneric/GenericModule'), { ssr: false });

import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query'; 

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

const ITEMS_PER_PAGE = 20;

export default function TrangChu({ isOpen, onClose, config, onOpenDetail, isEmbedded = false, extraFilter }: Props) {
    const queryClient = useQueryClient();
    
    const configRef = useRef(config);
    if (config.id !== configRef.current.id || config.bangDuLieu !== configRef.current.bangDuLieu) {
        configRef.current = config;
    }
    const stableConfig = configRef.current;

    const extraFilterRef = useRef(extraFilter);
    if (JSON.stringify(extraFilter) !== JSON.stringify(extraFilterRef.current)) {
        extraFilterRef.current = extraFilter;
    }
    const stableExtraFilter = extraFilterRef.current;

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'kanban'>('card');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('ALL');
    const [userRole, setUserRole] = useState('khach');
    const [isLevel3Open, setIsLevel3Open] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [syncing, setSyncing] = useState(false);
    
    const [groupByCol, setGroupByCol] = useState(stableConfig.widgetData?.groupBy || '');
    
    // 🟢 CHỐT: Luôn dùng bảng gốc
    const tableToQuery = stableConfig.bangDuLieu;

    useEffect(() => { if (typeof window !== 'undefined') setUserRole(localStorage.getItem('USER_ROLE') || 'khach'); }, []);
    const canAdd = ['admin', 'quanly', 'boss'].includes(userRole);
    const canDelete = ['admin', 'boss'].includes(userRole);

    // 🟢 HÀM XÓA CACHE MẠNH MẼ (Dùng cho cả Delete và Save)
    const forceRefreshAll = () => {
        // Hủy cache của LIST hiện tại
        queryClient.invalidateQueries({ queryKey: ['list', tableToQuery] });
        
        // 🟢 QUAN TRỌNG: Hủy luôn cache của Widget Level 1 (nếu key chứa tên bảng)
        // Cách này đảm bảo khi ra ngoài Level 1, nó sẽ thấy dữ liệu mới
        queryClient.invalidateQueries({ 
            predicate: (query) => {
                const key = query.queryKey as any[];
                // Nếu key có chứa tên bảng (ví dụ: ['widget', 'nhan_su'] hoặc ['count', 'nhan_su'])
                return key.includes(tableToQuery);
            }
        });
    };

    // 1. LẤY SCHEMA
    const { data: schemaCols = [] } = useQuery({
        queryKey: ['schema', stableConfig.bangDuLieu],
        queryFn: async () => {
            try {
                const { data, error } = await supabase.rpc('get_table_columns', { t_name: stableConfig.bangDuLieu });
                if (!error && data) {
                     return data.map((db: any) => ({
                        key: db.column_name,
                        label: db.column_name.replaceAll('_', ' '),
                        kieuDuLieu: db.column_name.includes('anh') ? 'image' : (db.data_type === 'boolean' ? 'boolean' : 'text'),
                        hienThiList: true,
                        hienThiDetail: true
                    }));
                }
            } catch (e) { console.error(e); }
            return [];
        },
        staleTime: Infinity,
        enabled: isOpen
    });

    const columns: CotHienThi[] = useMemo(() => {
        const configuredCols = stableConfig.danhSachCot || [];
        if (configuredCols.length > 0) return configuredCols;
        return schemaCols;
    }, [stableConfig.danhSachCot, schemaCols]);

    // 2. LẤY TABS
    const { data: tabOptions = [] } = useQuery({
        queryKey: ['tabs', tableToQuery, groupByCol],
        queryFn: async () => {
            if (!groupByCol) return [];
            const { data } = await supabase.from(tableToQuery).select(groupByCol).not(groupByCol, 'is', null);
            if (data) {
                const unique = Array.from(new Set(data.map((i: any) => i[groupByCol]))).sort();
                return unique as string[];
            }
            return [];
        },
        enabled: !!groupByCol && isOpen,
        staleTime: 1000 * 60 * 5 
    });

    // 3. LẤY DỮ LIỆU LIST
    const { data: queryResult, isLoading: loading } = useQuery({
        queryKey: ['list', tableToQuery, page, search, activeTab, stableExtraFilter, groupByCol],
        queryFn: async () => {
            let query = supabase.from(tableToQuery).select('*', { count: 'exact' });

            if (search) {
                const textCols = columns.filter(c => ['text', 'select_dynamic'].includes(c.kieuDuLieu)).map(c => c.key);
                if (textCols.length > 0) {
                    const orFilter = textCols.map(col => `${col}.ilike.%${search}%`).join(',');
                    query = query.or(orFilter);
                }
            }
            if (groupByCol && activeTab !== 'ALL') {
                query = query.eq(groupByCol, activeTab);
            }
            if (stableExtraFilter) {
                Object.entries(stableExtraFilter).forEach(([key, val]) => {
                    query = query.eq(key, val);
                });
            }

            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            
            const hasTaoLuc = columns.some(c => c.key === 'tao_luc');
            if (hasTaoLuc) query = query.order('tao_luc', { ascending: false });
            else query = query.order('id', { ascending: false });

            const { data, count, error } = await query.range(from, to);
            if (error) throw error;
            return { data, count };
        },
        placeholderData: keepPreviousData,
        enabled: isOpen,
        // 🟢 CẤM CACHE TUYỆT ĐỐI (Để sửa lỗi dữ liệu ma)
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always'
    });

    const data = queryResult?.data || [];
    const total = queryResult?.count || 0;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const deleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const { error } = await supabase.from(stableConfig.bangDuLieu).delete().in('id', ids);
            if (error) throw error;
        },
        onSuccess: () => {
            forceRefreshAll(); // 🟢 GỌI HÀM REFRESH MẠNH
            setSelectedIds([]);
            alert('Đã xóa thành công!');
        },
        onError: (err: any) => alert('Lỗi xóa: ' + err.message)
    });

    const syncConfig = layCauHinhDongBo(stableConfig);
    const handleSync = async () => {
        if (!confirm(`Bạn muốn ${syncConfig.tooltip}?`)) return;
        setSyncing(true);
        try {
            const { error } = await supabase.rpc(syncConfig.rpcFunc);
            if (error) throw error;
            forceRefreshAll(); // 🟢 GỌI HÀM REFRESH MẠNH
            alert('Đồng bộ thành công!');
        } catch (e: any) { alert(e.message); } 
        finally { setSyncing(false); }
    };

    const handleDelete = () => {
        if (!confirm(`Xóa vĩnh viễn ${selectedIds.length} mục?`)) return;
        deleteMutation.mutate(selectedIds);
    };

    const handleOpenLevel3 = (item: any) => { 
        setSelectedItem(item);
        setIsLevel3Open(true);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))) {
                e.preventDefault();
                const searchInput = document.getElementById('search-input-level2');
                if (searchInput) searchInput.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
                            search={search} onSearchChange={setSearch} onSearchEnter={() => setPage(1)}
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
                                onLui={() => setPage(p => Math.max(1, p - 1))} 
                                onToi={() => setPage(p => Math.min(totalPages, p + 1))} 
                            />
                        </div>
                    )}
                    <div className="w-full max-w-4xl pointer-events-auto">
                        <ThanhTacVu 
                            config={stableConfig} 
                            canAdd={canAdd} 
                            canConfig={userRole === 'admin'}
                            viewMode={viewMode} 
                            onToggleView={() => setViewMode(v => v === 'card' ? 'kanban' : 'card')}
                            onAdd={() => handleOpenLevel3(null)} 
                            onRefresh={() => forceRefreshAll()} 
                            onClose={onClose || (() => {})}
                            onSearch={(k) => { setSearch(k); setPage(1); }} 
                            search={search}
                            syncConfig={syncConfig} 
                            isSyncing={syncing} 
                            onSync={handleSync}
                            groupByCol={groupByCol} 
                            columns={columns} 
                            onSetGroupBy={setGroupByCol}
                            tabs={tabOptions}
                            activeTab={activeTab}
                            onTabChange={(t) => { setActiveTab(t); setPage(1); }}
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
        <>
            <Level3_FormChiTiet mode="level3"
                isOpen={isLevel3Open} 
                onClose={() => setIsLevel3Open(false)} 
                onSuccess={() => {
                    forceRefreshAll(); // 🟢 REFRESH KHI SAVE TỪ LEVEL 3
                    setIsLevel3Open(false);
                }} 
                config={stableConfig} 
                initialData={selectedItem ?? null} 
                userRole={userRole} 
                userEmail={typeof window !== 'undefined' ? localStorage.getItem('USER_EMAIL') || '' : ''} 
                parentTitle={stableConfig.tenModule} 
            />
        </>
    );

    if (isEmbedded) return <>{MainContent}{Level3Modal}</>;

    return (
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
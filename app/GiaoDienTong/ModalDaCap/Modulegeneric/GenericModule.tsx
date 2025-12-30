'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Loader2, User, FileText, Split, Shield, Zap, X, Trophy, History } from 'lucide-react';
import { ModuleConfig, CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query';

// Shared imports from all levels
import ThanhPhanTrang from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhPhanTrang';
import ThanhTab, { TabItem } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhTab';
import Level1_Widget_Generic from './level1generic/widget';
import { Level3Provider, useLevel3Context } from './level3generic/Level3Context';
import { useDuLieuLevel3 } from './level3generic/useDuLieuLevel3';
import { layCauHinhNgoaiLe } from './level3generic/CauHinhNgoaiLe';
import NutChucNangLevel3 from './level3generic/NutChucNang';
import Tab_ThongTin from './level3generic/Tab_ThongTin';
import TabContent from './level3generic/TabContent';
import Tab_NhatKyHoatDong from './level3generic/Tab_NhatKyHoatDong';
import Tab_ThanhTich from './level3generic/Tab_ThanhTich';
import AnhDaiDien from './level3generic/AvatarSection';
import GenericForm from './GenericForm';

// Level2 components
import HeaderNhung from './level2generic/HeaderNhung';
import KhungHienThi from './level2generic/KhungHienThi';
import ThanhChon from './level2generic/ThanhChon';
import ThanhTacVu from './level2generic/ThanhTacVu';
import { layCauHinhDongBo } from './level2generic/CauHinhDongBo';

type Mode = 'level1' | 'level2' | 'level3';

interface Props {
    mode: Mode;
    config: ModuleConfig;
    initialData?: any; // For level3
    onClose?: () => void;
    onSuccess?: () => void; // For level3
    onOpenDetail?: (item: any, config: ModuleConfig) => void; // For level2
    isEmbedded?: boolean;
    extraFilter?: Record<string, any>;
    isOpen?: boolean; // For modal modes
    userRole?: string; // For level3
    userEmail?: string; // For level3
    parentTitle?: string; // For level3
    isModalView?: boolean; // For level2 in modal
}

const ITEMS_PER_PAGE = 20;

export default function GenericModule({ 
    mode: initialMode, 
    config, 
    initialData, 
    onClose, 
    onSuccess,
    onOpenDetail,
    isEmbedded = false, 
    extraFilter,
    isOpen,
    userRole,
    userEmail,
    parentTitle,
    isModalView
}: Props) {
    const queryClient = useQueryClient();
    const [currentMode, setCurrentMode] = useState<Mode>(initialMode);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('form');
    const [shake, setShake] = useState(false);

    // Shared state for level2
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'kanban'>('card');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTabLevel2, setActiveTabLevel2] = useState('ALL');
    const [syncing, setSyncing] = useState(false);
    const [groupByCol, setGroupByCol] = useState(config.widgetData?.groupBy || '');

    // Auto set mode based on initialData
    useEffect(() => {
        if (initialData?.id && initialMode !== 'level3') {
            setCurrentMode('level3');
            setSelectedItem(initialData);
        }
    }, [initialData, initialMode]);

    // Handlers for transitions
    const handleGoToLevel2 = () => setCurrentMode('level2');
    const handleGoToLevel3 = (item: any) => {
        setSelectedItem(item);
        setCurrentMode('level3');
    };
    const handleBackToLevel2 = () => {
        setCurrentMode('level2');
        setSelectedItem(null);
    };
    const handleBackToLevel1 = () => {
        setCurrentMode('level1');
        setSelectedItem(null);
    };

    // Shared data fetching logic
    const { tableToQuery } = layCauHinhNgoaiLe(config.bangDuLieu, false);
    const isCreateMode = !selectedItem?.id;

    // Schema query (shared)
    const { data: dbCols = [] } = useQuery({
        queryKey: ['schema', config.bangDuLieu],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_table_columns', { t_name: config.bangDuLieu });
            if (error) {
                console.error("Schema error:", error);
                return [];
            }
            return data || [];
        },
        enabled: currentMode !== 'level1',
        staleTime: Infinity,
    });

    // Columns merge (shared)
    const columns: CotHienThi[] = useMemo(() => {
        const configuredCols = config.danhSachCot || [];
        if (configuredCols.length > 0) return configuredCols;
        return dbCols.map((db: any) => ({
            key: db.column_name,
            label: db.column_name.replaceAll('_', ' '),
            kieuDuLieu: db.column_name.includes('hinh_anh') ? 'image' : 'text',
            hienThiList: true,
            hienThiDetail: true,
        }));
    }, [config.danhSachCot, dbCols]);

    // Level2 data query
    const { data: listData, isLoading: loadingList } = useQuery({
        queryKey: ['list', tableToQuery, page, search, activeTabLevel2, extraFilter, groupByCol],
        queryFn: async () => {
            let query = supabase.from(tableToQuery).select('*', { count: 'exact' });
            if (search) {
                const textCols = columns.filter(c => ['text', 'select_dynamic'].includes(c.kieuDuLieu)).map(c => c.key);
                if (textCols.length > 0) {
                    query = query.or(textCols.map(col => `${col}.ilike.%${search}%`).join(','));
                }
            }
            if (groupByCol && activeTabLevel2 !== 'ALL') {
                query = query.eq(groupByCol, activeTabLevel2);
            }
            if (extraFilter) {
                Object.entries(extraFilter).forEach(([key, val]) => {
                    query = query.eq(key, val);
                });
            }
            query = query.order('tao_luc', { ascending: false }).range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
            const { data, count, error } = await query;
            if (error) throw error;
            return { data, count };
        },
        enabled: currentMode === 'level2',
        placeholderData: keepPreviousData,
    });

    const data = listData?.data || [];
    const total = listData?.count || 0;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // Level3 data query
    const { data: detailData, isLoading: loadingDetail } = useQuery({
        queryKey: ['detail', config.bangDuLieu, selectedItem?.id],
        queryFn: async () => {
            if (!selectedItem?.id) return null;
            const { data, error } = await supabase.from(config.bangDuLieu).select('*').eq('id', selectedItem.id).single();
            if (error) throw error;
            return data;
        },
        enabled: currentMode === 'level3' && !!selectedItem?.id,
    });

    const finalData = isCreateMode ? {} : (detailData || selectedItem || {});

    // Extended config for level3
    const extendedConfig: ModuleConfig = useMemo(() => {
        if (!dbCols) return config;
        const currentCols = config.danhSachCot || [];
        const currentKeys = currentCols.map(c => c.key);
        const missingCols: CotHienThi[] = dbCols
            .filter((db: any) => db.column_name && !currentKeys.includes(db.column_name))
            .map((db: any) => {
                let type = 'text';
                if (db.data_type === 'boolean') type = 'boolean';
                else if (['integer', 'numeric', 'float', 'double precision'].includes(db.data_type)) type = 'number';
                else if (['timestamp', 'date', 'timestamptz'].includes(db.data_type)) type = 'date';
                else if (db.column_name.includes('hinh_anh') || db.column_name.includes('avatar')) type = 'image';
                else if (db.column_name.includes('mo_ta') || db.column_name.includes('ghi_chu')) type = 'textarea';
                else if (db.column_name.endsWith('_id') && db.column_name !== 'id') type = 'select_dynamic';
                return {
                    key: db.column_name,
                    label: db.column_name.replaceAll('_', ' '),
                    kieuDuLieu: type,
                    hienThiList: false,
                    hienThiDetail: true,
                    batBuoc: db.is_nullable === 'NO' && db.column_name !== 'id'
                };
            });
        return { ...config, danhSachCot: [...currentCols, ...missingCols] };
    }, [config, dbCols]);

    // Level3 hooks
    const { customTabs, showLogout } = layCauHinhNgoaiLe(config.bangDuLieu, isCreateMode);
    const canEdit = isCreateMode || ['admin', 'quanly', 'boss'].includes('userRole'); // Assume userRole
    const activeCols = extendedConfig.danhSachCot || [];

    const tabList: TabItem[] = [
        { id: 'form', label: 'Thông Tin', icon: User },
        ...((config as any).tabs || []).map((t: any) => ({ id: t.id, label: t.label, icon: FileText })),
        ...customTabs,
        ...(!isCreateMode && config.virtualColumns ? config.virtualColumns.map(v => ({ id: v.key, label: v.label, icon: Split })) : [])
    ];

    // Auto edit for create
    useEffect(() => {
        if (isCreateMode && currentMode === 'level3') {
            // setIsEditing(true); // Commented out as per previous fix
        }
    }, [isCreateMode, currentMode]);

    // Render based on mode
    if (currentMode === 'level1') {
        return (
            <Level1_Widget_Generic 
                config={config} 
                onClick={handleGoToLevel2} 
            />
        );
    }

    if (currentMode === 'level2') {
        // Level2 UI
        const MainContent = (
            <div className={`relative w-full h-full bg-transparent ${isEmbedded ? '' : 'animate-in fade-in duration-300'}`}>
                <div className="absolute inset-0 z-10 overflow-y-auto custom-scroll">
                    <div className={`min-h-full ${isEmbedded ? 'pt-[100px]' : 'pt-[110px]'} pb-[130px] px-2 md:px-6`}>
                        <KhungHienThi 
                            loading={loadingList} 
                            data={data} 
                            viewMode={viewMode} 
                            columns={columns} 
                            groupByCol={groupByCol}
                            onRowClick={handleGoToLevel3} 
                            canEdit={true}
                            selectedIds={selectedIds} 
                            onSelect={(id) => setSelectedIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id])}
                            onDragEnd={() => {}}
                        />
                    </div>
                </div>

                {!isEmbedded && (
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
                                config={config} 
                                canAdd={true} // Assume
                                canConfig={true}
                                viewMode={viewMode} 
                                onToggleView={() => setViewMode(v => v === 'card' ? 'kanban' : 'card')}
                                onAdd={() => handleGoToLevel3(null)} 
                                onRefresh={() => queryClient.invalidateQueries({ queryKey: ['list', tableToQuery] })} 
                                onClose={onClose || handleBackToLevel1}
                                onSearch={(k) => { setSearch(k); setPage(1); }} 
                                search={search}
                                syncConfig={{ visible: false, label: '', tooltip: '', rpcFunc: '' }} // Assume
                                isSyncing={syncing} 
                                onSync={() => {}}
                                groupByCol={groupByCol} 
                                columns={columns} 
                                onSetGroupBy={setGroupByCol}
                                tabs={[]} // Assume
                                activeTab={activeTabLevel2}
                                onTabChange={(t) => { setActiveTabLevel2(t); setPage(1); }}
                            />
                        </div>
                    </div>
                )}

                <ThanhChon 
                    count={selectedIds.length} 
                    canDelete={true} 
                    onDelete={() => {}} 
                    onCancel={() => setSelectedIds([])} 
                />
            </div>
        );

        if (isEmbedded) return MainContent;

        if (isOpen !== false) { // For modal usage, render modal if isOpen is not explicitly false
            return (
                <div className="fixed inset-0 z-[3500] bg-black/80 backdrop-blur-sm flex flex-col shadow-none animate-in fade-in zoom-in-95 duration-300 overflow-hidden pointer-events-none">
                    <div className="w-full h-full pointer-events-auto flex flex-col">
                        <div className="flex-1 relative w-full h-[100dvh] overflow-hidden">
                            {MainContent}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }

    if (currentMode === 'level3') {
        // Level3 UI
        const isDataLoading = loadingDetail;
        if (isDataLoading && !isEditing) {
            return (
                <div className="fixed inset-0 z-[5000] bg-black/90 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#C69C6D]" size={40}/>
                </div>
            );
        }

        const title = finalData[(config as any).tieuDeCot] || finalData.ho_ten || finalData.ten_du_an || finalData.ten || (isCreateMode ? 'TẠO MỚI' : 'CHI TIẾT');
        
        const contextValue = { 
            config: {...extendedConfig, danhSachCot: activeCols}, 
            formData: finalData, 
            setFormData: () => {}, 
            isEditing, 
            isArranging: false, 
            dynamicOptions: {}, 
            onAddNewOption: () => {}, 
            onImageUpload: () => {}, 
            uploadingImg: false, 
            canEditColumn: () => true, 
            userRole: userRole || 'user', // Use passed userRole
            isOwner: false, 
            onUpdateColumnOrder: () => {} 
        };

        const Level3Content = (
            <Level3Provider value={contextValue}>
                <div className={`fixed inset-0 z-[4000] bg-black/80 backdrop-blur-sm flex flex-col shadow-none animate-in fade-in zoom-in-95 duration-300 overflow-hidden pointer-events-none ${shake ? 'animate-shake' : ''}`}>
                    <div className="w-full h-full pointer-events-auto flex flex-col">
                        <div className="flex-1 relative w-full h-[100dvh] overflow-hidden">
                            <div className="absolute inset-0 bg-black/80 pointer-events-auto backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose || handleBackToLevel2} />
                            <div className="relative pointer-events-auto overflow-hidden flex flex-col md:flex-row bg-[#0f0c0b] w-full h-full animate-in zoom-in-95 duration-300">
                                
                                {!isEditing && (
                                    <div className="w-full md:w-[350px] shrink-0 bg-gradient-to-b from-[#1a1512] to-[#0a0807] border-b md:border-b-0 md:border-r border-[#8B5E3C]/30 relative flex flex-col">
                                        <div className="p-6 text-center z-10">
                                            <Shield size={14} className="mx-auto text-[#C69C6D] mb-2"/>
                                            <h2 className="text-xl font-bold text-[#E8D4B9] uppercase line-clamp-2">{title}</h2>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-center p-4">
                                            <AnhDaiDien imgUrl={finalData.avatar || finalData.hinh_anh || ''} onUpload={()=>{}} uploading={false} canEdit={false} label=""/>
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md relative overflow-hidden min-h-0">
                                    {isEditing ? (
                                        <div className="flex-1 overflow-y-auto custom-scroll p-6 bg-[#161210]">
                                            <div className="max-w-3xl mx-auto">
                                                <div className="flex items-center justify-between border-b border-[#8B5E3C]/30 pb-4 mb-6">
                                                    <h3 className="text-lg font-bold text-[#C69C6D] uppercase flex items-center gap-2"><Zap size={18}/> {isCreateMode ? 'Tạo Dữ Liệu Mới' : 'Chỉnh Sửa Thông Tin'}</h3>
                                                    <button onClick={() => { if(isCreateMode) { onClose && onClose(); } else setIsEditing(false); }} className="p-2 hover:bg-white/10 rounded-full text-gray-400"><X size={20}/></button>
                                                </div>
                                                
                                                <GenericForm
                                                    config={extendedConfig}
                                                    initialData={finalData}
                                                    onSubmit={(data) => {
                                                        queryClient.invalidateQueries({ queryKey: ['list', tableToQuery] });
                                                        onSuccess && onSuccess();
                                                        if (isCreateMode) {
                                                            onClose && onClose();
                                                        } else {
                                                            setIsEditing(false);
                                                        }
                                                    }}
                                                    onCancel={() => {
                                                        if (isCreateMode) {
                                                            onClose && onClose();
                                                        } else {
                                                            setIsEditing(false);
                                                        }
                                                    }}
                                                    isCreateMode={isCreateMode}
                                                    userRole={userRole}
                                                    userEmail={userEmail}
                                                    parentTitle={parentTitle}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="shrink-0 border-b border-[#8B5E3C]/30 bg-black/40 overflow-x-auto scrollbar-hide">
                                                <ThanhTab danhSachTab={tabList} tabHienTai={activeTab} onChuyenTab={setActiveTab}/>
                                            </div>
                                            <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-6">
                                                {activeTab === 'form' ? <Tab_ThongTin /> 
                                                : activeTab === 'thanh_tich' ? <Tab_ThanhTich nhanSuId={selectedItem?.id} totalKhach={finalData?.total_khach || 0} totalViec={finalData?.total_viec || 0} totalMau={finalData?.total_mau || 0} />
                                                : activeTab === 'nhat_ky_hoat_dong' ? <Tab_NhatKyHoatDong nhanSuId={selectedItem?.id} loginHistory={finalData?.lich_su_dang_nhap} />
                                                : <TabContent activeTab={activeTab} virtualData={{}} />}
                                            </div>
                                            <div className="shrink-0 p-3 border-t border-[#8B5E3C]/30 bg-black/60 flex justify-end gap-3 backdrop-blur-md">
                                                <NutChucNangLevel3 
                                                    isCreateMode={false} 
                                                    isEditing={false} 
                                                    isArranging={false} 
                                                    loading={false} 
                                                    canEditRecord={canEdit} 
                                                    canDeleteRecord={true} 
                                                    isAdmin={true} 
                                                    hasError={false} 
                                                    onSave={()=>{}} 
                                                    onEdit={()=>setIsEditing(true)} 
                                                    onCancel={()=>{}} 
                                                    onDelete={() => {}} 
                                                    onClose={onClose || handleBackToLevel2} 
                                                    onToggleArrange={()=>{}} 
                                                    onSaveLayout={()=>{}} 
                                                    onLogout={showLogout ? () => {} : undefined} 
                                                    onFixDB={() => {}} 
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Level3Provider>
        );

        if (isOpen !== false) { // For modal usage, render modal if isOpen is not explicitly false
            return Level3Content;
        }
        return null;
    }

    return null;
}
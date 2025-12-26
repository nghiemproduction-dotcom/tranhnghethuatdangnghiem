'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Loader2, Layers, Plus, Filter, Check, ListFilter, Trash2, XCircle, CheckSquare } from 'lucide-react'; 
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig, CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

import ThanhDieuHuong from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuHuong';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';
import ThanhPhanTrang from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhPhanTrang';   
import ThanhTab, { TabItem } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhTab';

// Import cùng cấp
import NutChucNang from './NutChucNang'; 
import CardView from './CardView';
import TableView from './TableView';
import KanbanView from './KanbanView';

// Import Level 3 (Ra ngoài 1 cấp -> vào Level3)
import Level3_FormChiTiet from '../Level3/level3'; 

export default function Level2_Generic({ isOpen, onClose, config, onOpenDetail, isEmbedded = false, extraFilter }: any) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // 🟢 FIX LỖI: Khai báo rõ kiểu string[] để TS không phải suy diễn sâu
    const [searchableColumns, setSearchableColumns] = useState<string[]>([]);
    
    const columns: CotHienThi[] = useMemo(() => config.danhSachCot || [], [config.danhSachCot]);
    
    const getSmartGroupByColumn = (): string => {
        if (config.listConfig?.groupByColumn) return config.listConfig.groupByColumn;
        const priorityCols = ['trang_thai', 'vi_tri', 'loai', 'chuc_vu', 'phong_ban', 'department', 'status', 'role', 'nhom'];
        for (const key of priorityCols) { if (columns.some(c => c.key === key)) return key; }
        return 'trang_thai'; 
    };
    
    // 🟢 FIX LỖI 2589: Khai báo rõ <string> cho state này
    const [groupByCol, setGroupByCol] = useState<string>(getSmartGroupByColumn());
    
    const [activeTab, setActiveTab] = useState('ALL');
    const [tabOptions, setTabOptions] = useState<string[]>([]);
    const [showGroupSelector, setShowGroupSelector] = useState(false);
    
    const [search, setSearch] = useState(''); 
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const ITEMS_PER_PAGE = isEmbedded ? 6 : 20; 

    const [userRole, setUserRole] = useState('khach');
    const [isLevel3Open, setIsLevel3Open] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'table' | 'card' | 'kanban'>('table'); 
    
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const canAdd = ['admin', 'quanly', 'boss'].includes(userRole);
    const canDelete = ['admin', 'boss'].includes(userRole);
    const canEdit = ['admin', 'quanly', 'boss'].includes(userRole);
    const canConfig = userRole === 'admin';

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    useEffect(() => { if (typeof window !== 'undefined') setUserRole(localStorage.getItem('USER_ROLE') || 'khach'); }, []);
    
    const fetchSchemaAndSetup = async () => {
         try {
            const { data: tableInfo } = await supabase.rpc('get_table_schema', { t_name: config.bangDuLieu });
            if (tableInfo) {
                // Ép kiểu any cho col để tránh lỗi suy diễn
                const textCols = tableInfo.filter((col: any) => ['text', 'character varying', 'varchar', 'char'].includes(col.data_type)).map((col: any) => col.column_name);
                setSearchableColumns(textCols);
                
                // Logic tìm cột group mặc định nếu chưa có
                if (groupByCol === 'trang_thai' && !tableInfo.find((c: any) => c.column_name === 'trang_thai')) {
                    const candidate = tableInfo.find((c: any) => ['vi_tri', 'loai', 'chuc_vu', 'role'].includes(c.column_name));
                    if (candidate) setGroupByCol(candidate.column_name);
                }
            }
        } catch (e) { console.error("Lỗi Schema:", e); }
    };

    useEffect(() => { if (isOpen && config.bangDuLieu) { fetchSchemaAndSetup().then(() => reloadAll()); } }, [isOpen, config.bangDuLieu]);
    useEffect(() => { if (isOpen) reloadAll(); }, [groupByCol]);
    
    useEffect(() => { if (isOpen && extraFilter) reloadAll(); }, [JSON.stringify(extraFilter)]);

    const reloadAll = () => { setPage(1); setActiveTab('ALL'); setSelectedIds([]); fetchTabOptions(); fetchData(1, 'ALL', search); };
    
    const fetchTabOptions = async () => {
        try {
            const { data } = await supabase.from(config.bangDuLieu).select(groupByCol).not(groupByCol, 'is', null);
            if (data) {
                // @ts-ignore
                const unique = Array.from(new Set(data.map((item: any) => item[groupByCol])));
                setTabOptions(unique.sort());
            } else { setTabOptions([]); }
        } catch (error) { setTabOptions([]); }
    };

    const fetchData = async (pageNumber: number = page, currentTab: string = activeTab, keyword: string = search) => {
        setLoading(true);
        try {
            const from = (pageNumber - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            
            let selectQuery = '*';
            if (config.bangDuLieu === 'nhan_su') {
                selectQuery = '*, khach_hang(count)'; 
            }

            let query = supabase.from(config.bangDuLieu).select(selectQuery, { count: 'exact' });
            
            if (extraFilter) {
                Object.entries(extraFilter).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            if (currentTab !== 'ALL' && groupByCol) query = query.eq(groupByCol, currentTab);
            
            if (keyword.trim()) {
                // Sử dụng cột tìm kiếm đã setup hoặc mặc định
                const cols = searchableColumns.length > 0 ? searchableColumns : ['ho_ten', 'ten', 'ten_hien_thi', 'email', 'so_dien_thoai', 'name', 'title', 'mo_ta'];
                const filterString = cols.map(col => `${col}.ilike.%${keyword}%`).join(',');
                if (filterString) query = query.or(filterString);
            }
            query = query.order('created_at', { ascending: false }).range(from, to);
            
            const { data: result, count, error } = await query;
            if (error) throw error;

            const formattedData = (result as any[])?.map((item: any) => {
                if (item.khach_hang && Array.isArray(item.khach_hang)) {
                    const countObj = item.khach_hang[0];
                    return { ...item, total_khach: countObj ? countObj.count : 0 };
                }
                return item;
            });

            setData(formattedData || []);
            setTotal(count || 0);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleToggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const handleSelectAll = () => {
        const allOnPageSelected = data.every(item => selectedIds.includes(item.id));
        if (allOnPageSelected) {
            const idsOnPage = data.map(i => i.id);
            setSelectedIds(prev => prev.filter(id => !idsOnPage.includes(id)));
        } else {
            const idsOnPage = data.map(i => i.id);
            setSelectedIds(prev => Array.from(new Set([...prev, ...idsOnPage])));
        }
    };
    const handleBulkDelete = async () => {
        if (!confirm(`Bạn xóa ${selectedIds.length} mục đã chọn?`)) return;
        setLoading(true);
        try {
            const { error } = await supabase.from(config.bangDuLieu).delete().in('id', selectedIds);
            if (error) throw error;
            alert('Đã xóa!'); setSelectedIds([]); fetchData(page, activeTab, search);
        } catch (err: any) { alert('Lỗi: ' + err.message); } finally { setLoading(false); }
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
            const draggedId = active.id;
            const newGroupValue = over.id;
            const oldData = [...data];
            setData(prev => prev.map(row => row.id === draggedId ? { ...row, [groupByCol]: newGroupValue } : row));

            try {
                const { error } = await supabase.from(config.bangDuLieu).update({ [groupByCol]: newGroupValue }).eq('id', draggedId);
                if (error) throw error;
            } catch (err) {
                console.error("Lỗi cập nhật Kanban:", err);
                setData(oldData); 
                alert("Không thể cập nhật trạng thái.");
            }
        }
    };

    const toggleViewMode = () => {
        if (viewMode === 'table') setViewMode('card');
        else if (viewMode === 'card') setViewMode('kanban');
        else setViewMode('table');
    };

    const handleRefresh = async () => { setLoading(true); setTimeout(() => fetchData(page, activeTab, search), 500); };
    const handleTabChange = (tab: string) => { setActiveTab(tab); setPage(1); fetchData(1, tab, search); setSelectedIds([]); };
    const handleOpenLevel3 = (item: any) => { setSelectedItem(item); setIsLevel3Open(true); };

    const tabList: TabItem[] = [{ id: 'ALL', label: 'TẤT CẢ', icon: Layers }, ...tabOptions.map(opt => ({ id: opt, label: opt ? String(opt).replace(/_/g, ' ').toUpperCase() : 'KHÁC', icon: Filter }))];
    
    let displayColumns = columns;
    if (displayColumns.length === 0 && data.length > 0) {
        displayColumns = Object.keys(data[0]).filter(k => !['id','created_at','updated_at','nguoi_tao_id', 'khach_hang', 'total_khach'].includes(k)).map(k => ({ key: k, label: k.replace(/_/g, ' ').toUpperCase(), kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true, tuDong: false, batBuoc: false }));
    }
    const imgCol = displayColumns.find(c => ['hinh_anh', 'avatar'].includes(c.key));
    const titleCol = displayColumns[0] || { key: 'id' };
    const groupableColumns = displayColumns.filter(c => ['select', 'text', 'radio'].includes(c.kieuDuLieu) || ['trang_thai', 'loai', 'vi_tri', 'chuc_vu', 'phong_ban', 'gioi_tinh', 'role'].includes(c.key));

    if (!isOpen) return null;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const content = (
        <div className={`flex flex-col h-full bg-[#0F0C0B] ${isEmbedded ? '' : 'animate-in slide-in-from-right-10 duration-300'}`}>
            
            {/* Ẩn thanh Header khi đang nhúng */}
            {!isEmbedded && (
                <div className="shrink-0 z-50 bg-[#0a0807] border-b border-[#8B5E3C]/30 shadow-lg flex flex-col">
                     <ThanhDieuHuong danhSachCap={[{ id: 'back', ten: 'Quay Lại', onClick: onClose || (() => {}) }, { id: 'current', ten: config.tenModule.toUpperCase() }]} />
                    <div className="flex items-center justify-between pr-2 bg-[#0a0807] py-1">
                        <div className="flex-1 overflow-hidden">
                            <ThanhTab danhSachTab={tabList} tabHienTai={activeTab} onChuyenTab={handleTabChange} />
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                            {groupableColumns.length > 0 && (
                                <div className="relative" ref={dropdownRef}>
                                    <button onClick={() => setShowGroupSelector(!showGroupSelector)} className={`p-2 rounded-lg transition-all border flex items-center gap-2 ${showGroupSelector ? 'bg-[#C69C6D] text-[#1a120f] border-[#C69C6D]' : 'bg-[#161210] text-[#8B5E3C] border-[#8B5E3C]/30 hover:text-[#C69C6D]'}`} title={`Đang lọc theo: ${groupByCol}`}>
                                        <ListFilter size={16} />
                                        <span className="text-[9px] font-bold uppercase hidden sm:inline max-w-[60px] truncate">{displayColumns.find(c => c.key === groupByCol)?.label || groupByCol}</span>
                                    </button>
                                    {showGroupSelector && (
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-[#161210] border border-[#8B5E3C]/30 rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                                            <div className="px-3 py-2 bg-[#1a120f] border-b border-[#8B5E3C]/20 text-[10px] font-bold text-[#5D4037] uppercase">Chọn Cột Để Phân Loại</div>
                                            <div className="max-h-60 overflow-y-auto custom-scroll p-1">
                                                {groupableColumns.map(col => (
                                                    <button key={col.key} onClick={() => { setGroupByCol(col.key); setShowGroupSelector(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between group transition-colors ${groupByCol === col.key ? 'bg-[#C69C6D]/10 text-[#C69C6D]' : 'text-[#E8D4B9] hover:bg-[#2a2420]'}`}>
                                                        <span className="truncate">{col.label}</span>
                                                        {groupByCol === col.key && <Check size={14} className="text-[#C69C6D]"/>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {canAdd && ( <button onClick={() => handleOpenLevel3(null)} className="p-2 bg-[#C69C6D] text-[#1a120f] rounded-lg hover:bg-[#b08b5e] shadow-lg transition-transform hover:scale-105" title="Thêm mới"><Plus size={16}/></button> )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Body */}
            <div className={`flex-1 flex flex-col relative overflow-hidden bg-[#0F0C0B] ${isEmbedded ? 'rounded-b-xl' : ''}`}>
                <div className="flex-1 relative overflow-hidden">
                    {loading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-[2px]"><Loader2 className="animate-spin text-[#C69C6D]" size={30}/></div>}
                    
                    {data.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#8B5E3C] text-xs italic opacity-50"><p>Chưa có dữ liệu.</p></div>
                    ) : ( 
                        <>
                            {viewMode === 'table' && (
                                <TableView 
                                    data={data} columns={displayColumns} page={page} itemsPerPage={ITEMS_PER_PAGE} 
                                    onRowClick={handleOpenLevel3} 
                                    selectedIds={selectedIds} onSelectRow={handleToggleSelect} onSelectAll={handleSelectAll} 
                                />
                            )}
                            {viewMode === 'card' && (
                                <CardView 
                                    data={data} columns={displayColumns} imgCol={imgCol} titleCol={titleCol} 
                                    canEdit={true} onRowClick={handleOpenLevel3} 
                                    selectedIds={selectedIds} onSelect={handleToggleSelect} 
                                />
                            )}
                            {viewMode === 'kanban' && (
                                <KanbanView 
                                    data={data} kanbanGroupBy={groupByCol} columns={displayColumns} imgCol={imgCol} titleCol={titleCol} 
                                    onRowClick={handleOpenLevel3} sensors={sensors} onDragEnd={handleDragEnd} canEdit={canEdit}
                                    selectedIds={selectedIds} onSelect={handleToggleSelect}
                                />
                            )}
                        </>
                    )}
                </div>

                {totalPages > 1 && viewMode !== 'kanban' && (
                     <div className="shrink-0 border-t border-[#8B5E3C]/10 bg-[#110d0c]">
                        <ThanhPhanTrang trangHienTai={page} tongSoTrang={totalPages} onLui={() => page > 1 && fetchData(page - 1, activeTab, search)} onToi={() => page < totalPages && fetchData(page + 1, activeTab, search)} />
                     </div>
                )}
            </div>

            {/* Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[3000] animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-[#1a120f] border border-[#8B5E3C] shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-full px-6 py-2 flex items-center gap-4">
                        <div className="flex items-center gap-2 border-r border-[#8B5E3C]/30 pr-4">
                            <CheckSquare size={18} className="text-[#C69C6D]" />
                            <span className="text-[#C69C6D] font-bold text-sm">{selectedIds.length} đã chọn</span>
                        </div>
                        {canDelete && (
                            <button onClick={handleBulkDelete} className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold text-sm transition-colors">
                                <Trash2 size={16} /><span>Xóa</span>
                            </button>
                        )}
                        <button onClick={() => setSelectedIds([])} className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-xs uppercase font-semibold ml-2">
                            <XCircle size={14} />Hủy
                        </button>
                    </div>
                </div>
            )}

            {!isEmbedded && !isLevel3Open && (
                <NutChucNang 
                    config={config} canAdd={canAdd} canConfig={canConfig} 
                    viewMode={viewMode} onToggleView={toggleViewMode} 
                    onAdd={() => handleOpenLevel3(null)} onRefresh={handleRefresh} onClose={onClose || (() => {})} 
                    onSearchData={(k: any) => { setSearch(k); setPage(1); fetchData(1, activeTab, k); }} currentSearch={search} 
                    onSaveConfig={async () => {}} 
                />
            )}
        </div>
    );

    const level3Modal = (
        <Level3_FormChiTiet isOpen={isLevel3Open} onClose={() => setIsLevel3Open(false)} onSuccess={() => fetchData(page, activeTab, search)} config={config} initialData={selectedItem} userRole={userRole} userEmail={typeof window !== 'undefined' ? localStorage.getItem('USER_EMAIL') || '' : ''} parentTitle={config.tenModule} />
    );

    if (isEmbedded) return ( <>{content}{level3Modal}</> );

    return (
        <div className="fixed top-0 left-0 right-0 bottom-[clamp(65px,16vw,85px)] z-[2200] bg-[#0a0807] flex flex-col shadow-2xl">
             <NoidungModal>{content}</NoidungModal>
             {level3Modal}
        </div>
    );
}
'use client';

import React, { useEffect, useState } from 'react';
// 🟢 THÊM ICON Users, RefreshCw
import { 
    X, Plus, Search, Edit, Loader2, 
    LayoutGrid, Table as IconTable, Kanban as IconKanban, 
    ChevronLeft, ChevronRight, Settings2, MoreHorizontal, ImageIcon, RefreshCw
} from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule';

import { DndContext, useDraggable, useDroppable, DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// IMPORT LEVEL 3
import Level3_FormChiTiet from './Level3_FormChiTiet';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    config: ModuleConfig;
}

// ... (Giữ nguyên các component KanbanCard, KanbanColumn không thay đổi) ...
const KanbanCard = ({ id, data, titleKey, subCols, imageCol, onClick }: any) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 999 : 1 };
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5 hover:border-blue-500/50 cursor-grab active:cursor-grabbing shadow-sm group relative touch-none">
            <div className="absolute inset-0 z-10" onDoubleClick={onClick}></div>
            <div className="flex items-start gap-3 mb-2">
                {imageCol && data[imageCol.key] ? (<img src={data[imageCol.key]} className="w-8 h-8 rounded-full object-cover bg-[#222] shrink-0" alt=""/>) : (<div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">{String(data[titleKey] || '?').charAt(0).toUpperCase()}</div>)}
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-200 truncate">{String(data[titleKey] || 'Chưa đặt tên')}</div>
                    <div className="text-[10px] text-gray-500 truncate mt-0.5">{subCols?.[0] ? String(data[subCols[0].key] || '') : ''}</div>
                </div>
            </div>
        </div>
    );
};

const KanbanColumn = ({ id, title, count, children }: any) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className="min-w-[280px] w-[280px] bg-[#111] border border-white/10 rounded-xl flex flex-col h-full max-h-full shrink-0">
            <div className="p-3 border-b border-white/5 bg-[#161616] flex justify-between items-center rounded-t-xl sticky top-0 z-10">
                <span className="font-bold text-xs text-gray-300 uppercase truncate max-w-[200px]" title={title}>{title}</span>
                <span className="bg-white/10 text-[9px] font-mono px-2 py-0.5 rounded text-gray-400">{count}</span>
            </div>
            <div className="p-2 space-y-2 flex-1 bg-[#0a0a0a] custom-hover-scroll">{children}</div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function Level2_DanhSachModal({ isOpen, onClose, config }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'card' | 'kanban'>('table');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const ITEMS_PER_PAGE = 10;
    const [kanbanGroupBy, setKanbanGroupBy] = useState<string>(''); 
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor));

    // LEVEL 3 STATE
    const [isLevel3Open, setIsLevel3Open] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [userRole, setUserRole] = useState('user'); 
    
    // 🟢 STATE CHO SYNC USER
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
            const laAdmin = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
            if (laAdmin) { setUserRole('admin'); } 
            else {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.email?.includes('admin')) setUserRole('quan_ly');
                else setUserRole('user');
            }
        };
        checkRole();

        if (isOpen && config.bangDuLieu) {
            setPage(1);
            fetchData(1);
            if(config.kieuHienThiList) setViewMode(config.kieuHienThiList as any);
            const defaultGroup = config.danhSachCot?.find(c => ['status','trang_thai','vi_tri','position','loai','type'].some(k => c.key.includes(k)))?.key;
            if(defaultGroup) setKanbanGroupBy(defaultGroup);
        }
    }, [isOpen, config]);

    const fetchData = async (pageNumber: number) => {
        setLoading(true);
        try {
            const from = (pageNumber - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            let query = supabase.from(config.bangDuLieu).select('*', { count: 'exact' });
            if (search.trim()) {
                const searchCol = config.danhSachCot?.find(c => c.key.includes('ten'))?.key || config.danhSachCot?.[0]?.key || 'id';
                query = query.ilike(searchCol, `%${search}%`);
            }
            const { data: result, count, error } = await query.range(from, to);
            if (error) { console.error(error); } else { setData(result || []); setTotal(count || 0); }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= Math.ceil(total / ITEMS_PER_PAGE)) {
            setPage(newPage);
            fetchData(newPage);
        }
    };

    const handleOpenAdd = () => { setSelectedItem(null); setIsLevel3Open(true); };
    const handleOpenDetail = (item: any) => { setSelectedItem(item); setIsLevel3Open(true); };
    const handleLevel3Success = () => { fetchData(page); };

    const handleKanbanDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        const itemId = active.id as string;
        const newGroupValue = over.id as string;
        const oldData = [...data];
        setData(prev => prev.map(item => String(item.id) === itemId ? { ...item, [kanbanGroupBy]: newGroupValue } : item));
        try {
            const { error } = await supabase.from(config.bangDuLieu).update({ [kanbanGroupBy]: newGroupValue }).eq('id', itemId);
            if (error) throw error;
        } catch (err) { console.error("Lỗi update kanban:", err); setData(oldData); }
    };

    // 🟢 HÀM GỌI API ĐỒNG BỘ USER
    const handleSyncUsers = async () => {
        if (!confirm('Hệ thống sẽ quét bảng "nhan_su" để:\n- Tạo tài khoản cho nhân sự mới.\n- Cập nhật thông tin nếu có thay đổi.\n- Xóa tài khoản nếu nhân sự không còn.\n\nBạn có chắc chắn muốn tiếp tục?')) return;
        
        setIsSyncing(true);
        try {
            const res = await fetch('/api/sync-users', { method: 'POST' });
            const result = await res.json();
            
            if (!res.ok) throw new Error(result.error || 'Lỗi kết nối API');
            
            alert(`Đồng bộ hoàn tất!\n\n✅ Thêm mới: ${result.added}\n🔄 Cập nhật: ${result.updated}\n🗑️ Đã xóa: ${result.deleted}`);
        } catch (err: any) {
            alert(`Lỗi đồng bộ: ${err.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    if (!isOpen) return null;

    let columns = config.danhSachCot?.filter(c => c.hienThiList) || [];
    if (columns.length === 0 && data.length > 0) {
        columns = Object.keys(data[0]).map(k => ({ key: k, label: k, kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true }));
    }
    const imgCol = columns.find(c => ['hinh_anh', 'avatar', 'image', 'picture', 'photo'].includes(c.key));
    const titleCol = columns[0] || { key: 'id', label: 'ID' };
    const canEdit = ['admin', 'quan_ly', 'admin_cung'].includes(userRole);

    // --- RENDERERS (Table, Card, Kanban giữ nguyên) ---
    const renderTable = () => (
        <div className="w-full h-full custom-hover-scroll bg-[#0a0a0a]">
            <table className="w-full text-sm text-gray-400 border-collapse min-w-[800px]">
                <thead className="bg-[#151515] text-xs uppercase font-bold text-gray-300 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-4 py-3 text-center border-b border-white/10 w-12 bg-[#151515]">#</th>
                        {columns.map(col => <th key={col.key} className="px-4 py-3 border-b border-white/10 whitespace-nowrap bg-[#151515]">{col.label}</th>)}
                        <th className="px-4 py-3 border-b border-white/10 text-right bg-[#151515]">...</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.map((row, idx) => (
                        <tr key={idx} onClick={() => handleOpenDetail(row)} className="hover:bg-[#1a1a1a] transition-colors group cursor-pointer">
                            <td className="px-4 py-3 text-center text-gray-600 font-mono text-xs">{(page-1)*ITEMS_PER_PAGE + idx + 1}</td>
                            {columns.map(col => {
                                const val = row[col.key];
                                if (['hinh_anh', 'avatar', 'image'].includes(col.key)) return <td key={col.key} className="px-4 py-2"><img src={val} className="w-8 h-8 rounded-full bg-[#222] object-cover border border-white/10" alt=""/></td>
                                return <td key={col.key} className="px-4 py-3 truncate max-w-[200px] align-middle">{String(val || '-')}</td>;
                            })}
                            <td className="px-4 py-3 text-right"><button className="p-1.5 hover:bg-white/10 rounded text-gray-500 hover:text-white"><MoreHorizontal size={16}/></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderCard = () => (
        <div className="h-full w-full custom-hover-scroll p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {data.map((row, idx) => {
                    const imgUrl = imgCol ? row[imgCol.key] : null;
                    return (
                        <div key={idx} onClick={() => handleOpenDetail(row)} className="bg-[#111] border border-white/10 rounded-xl hover:border-blue-500/40 hover:bg-[#161616] transition-all group flex flex-col overflow-hidden relative shadow-sm h-fit cursor-pointer">
                            <div className="w-full aspect-[16/9] bg-[#1a1a1a] relative flex items-center justify-center overflow-hidden border-b border-white/5">
                                {imgUrl ? <img src={imgUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e: any) => e.target.style.display='none'}/> : <div className="flex flex-col items-center justify-center text-gray-700"><ImageIcon size={32} strokeWidth={1}/></div>}
                                <button className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-blue-600 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"><Edit size={14}/></button>
                            </div>
                            <div className="p-4 flex flex-col gap-1">
                                <h3 className="font-bold text-white text-sm truncate">{String(row[titleCol.key] || 'No Title')}</h3>
                                {columns[1] && <p className="text-xs text-gray-500 truncate">{String(row[columns[1].key] || '-')}</p>}
                                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                                    {columns.slice(2, 4).map(c => <div key={c.key} className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded truncate max-w-full">{String(row[c.key] || '-')}</div>)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderKanban = () => {
        if (!kanbanGroupBy) return <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2"><Settings2/> Vui lòng chọn cột để phân nhóm Kanban.</div>;
        const groups: Record<string, any[]> = {};
        data.forEach(row => { const val = String(row[kanbanGroupBy] || 'Chưa phân loại'); if (!groups[val]) groups[val] = []; groups[val].push(row); });
        const sortedKeys = Object.keys(groups).sort();
        return (
            <DndContext sensors={sensors} onDragEnd={handleKanbanDragEnd}>
                <div className="flex gap-4 h-full p-4 items-start custom-hover-scroll">
                    {sortedKeys.map((groupName) => (
                        <KanbanColumn key={groupName} id={groupName} title={groupName} count={groups[groupName].length}>
                            {groups[groupName].map((row) => <KanbanCard key={row.id} id={String(row.id)} data={row} titleKey={titleCol.key} subCols={columns.slice(1,3)} imageCol={imgCol} onClick={() => handleOpenDetail(row)}/>)}
                        </KanbanColumn>
                    ))}
                    <div className="w-4 shrink-0"></div> 
                </div>
            </DndContext>
        );
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-[#000] flex flex-col animate-in slide-in-from-bottom-5 duration-200">
            {/* HEADER */}
            <div className="h-14 px-4 md:px-6 border-b border-white/10 flex items-center justify-between bg-[#0a0a0a] shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors shrink-0"><X size={20}/></button>
                    <div className="flex flex-col min-w-0">
                        <h2 className="text-base font-bold text-white uppercase tracking-wider truncate">{config.tenModule}</h2>
                        <p className="text-[10px] text-gray-500 font-mono truncate hidden sm:block">SOURCE: {config.bangDuLieu}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    
                    {/* 🟢 NÚT ĐỒNG BỘ USER (Chỉ hiện cho bảng nhan_su và admin) */}
                    {config.bangDuLieu === 'nhan_su' && canEdit && (
                        <button 
                            onClick={handleSyncUsers}
                            disabled={isSyncing}
                            className="flex items-center gap-2 px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-xs shadow-lg transition-all disabled:opacity-50"
                            title="Đồng bộ User Supabase Auth với bảng Nhân sự"
                        >
                            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> 
                            <span className="hidden sm:inline">{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ User'}</span>
                        </button>
                    )}

                    {canEdit && (
                        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs shadow-lg shadow-blue-900/20 transition-all">
                            <Plus size={16}/> <span className="hidden sm:inline">Thêm Mới</span>
                        </button>
                    )}
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="border-b border-white/10 bg-[#0a0a0a] shrink-0">
                <div className="flex flex-wrap items-center gap-3 p-3 px-4 md:px-6">
                    <div className="relative flex-1 min-w-[150px] max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={14}/>
                        <input type="text" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchData(1)} className="w-full bg-[#111] border border-white/10 rounded px-9 py-2 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder-gray-600 focus:bg-[#151515]"/>
                    </div>
                    <div className="flex bg-[#111] rounded border border-white/10 p-0.5 shrink-0">
                        {[ { id: 'table', icon: IconTable }, { id: 'card', icon: LayoutGrid }, { id: 'kanban', icon: IconKanban } ].map((m) => (
                            <button key={m.id} onClick={() => setViewMode(m.id as any)} className={`p-1.5 rounded-sm transition-all ${viewMode===m.id ? 'bg-white/10 text-white shadow-sm' : 'text-gray-600 hover:text-white'}`}><m.icon size={16}/></button>
                        ))}
                    </div>
                    {viewMode === 'kanban' && (
                        <div className="flex items-center gap-2 bg-[#111] border border-white/10 rounded px-2 py-1 shrink-0">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Nhóm:</span>
                            <select value={kanbanGroupBy} onChange={(e) => setKanbanGroupBy(e.target.value)} className="bg-transparent text-xs text-blue-400 font-bold outline-none cursor-pointer appearance-none pr-1">
                                {config.danhSachCot?.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden bg-[#050505] relative flex flex-col">
                {loading ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20 bg-black/50 backdrop-blur-sm"><Loader2 className="animate-spin text-blue-600" size={24}/><span className="text-gray-400 text-xs">Đang tải...</span></div> : null}
                <div className="flex-1 overflow-hidden relative">
                    {data.length === 0 && !loading ? <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600"><Search size={40} className="mb-2 opacity-20"/><span className="text-sm">Không tìm thấy dữ liệu.</span></div> : (
                        <div className="h-full w-full overflow-hidden">
                            {viewMode === 'table' && renderTable()}
                            {viewMode === 'card' && <div className="h-full custom-hover-scroll p-4">{renderCard()}</div>}
                            {viewMode === 'kanban' && renderKanban()}
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER */}
            <div className="h-12 border-t border-white/10 bg-[#0a0a0a] flex items-center justify-between px-4 md:px-6 shrink-0 safe-area-bottom">
                <span className="text-[10px] text-gray-500 truncate">Đang xem <strong>{(page - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong>{Math.min(page * ITEMS_PER_PAGE, total)}</strong> / <strong>{total}</strong></span>
                <div className="flex items-center gap-2">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft size={14}/></button>
                    <span className="text-xs font-mono text-white bg-[#151515] px-3 py-1.5 rounded border border-white/5 min-w-[30px] text-center">{page}</span>
                    <button onClick={() => handlePageChange(page + 1)} disabled={page * ITEMS_PER_PAGE >= total} className="w-8 h-8 flex items-center justify-center rounded border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight size={14}/></button>
                </div>
            </div>

            {/* MODAL LEVEL 3 */}
            <Level3_FormChiTiet isOpen={isLevel3Open} onClose={() => setIsLevel3Open(false)} onSuccess={handleLevel3Success} config={config} initialData={selectedItem} userRole={userRole}/>
        </div>
    );
}
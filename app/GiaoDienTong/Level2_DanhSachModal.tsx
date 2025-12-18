'use client';

import React, { useEffect, useState } from 'react';
import { 
    X, Plus, Search, Edit, Loader2, 
    LayoutGrid, Table as IconTable, Kanban as IconKanban, 
    ChevronLeft, ChevronRight, Settings2, MoreHorizontal, ImageIcon, RefreshCw, ArrowLeft, ArrowRight
} from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule';

import { DndContext, useDraggable, useDroppable, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import Level3_FormChiTiet from './Level3_FormChiTiet';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    config: ModuleConfig;
}

// --- SUB-COMPONENTS (KANBAN) ---

const KanbanCard = ({ id, data, titleKey, subCols, imageCol, onClick }: any) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    
    const style = { 
        transform: CSS.Translate.toString(transform), 
        opacity: isDragging ? 0.5 : 1, 
        zIndex: isDragging ? 999 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes} 
            className="bg-[#1a120f] p-3 rounded-lg border border-[#8B5E3C]/30 hover:border-[#C69C6D] cursor-grab active:cursor-grabbing shadow-sm group relative touch-none select-none transition-all duration-200"
        >
            {/* Layer bắt sự kiện double click */}
            <div className="absolute inset-0 z-10" onDoubleClick={onClick}></div>
            
            <div className="flex items-start gap-3">
                {imageCol && data[imageCol.key] ? (
                    <img src={data[imageCol.key]} className="w-9 h-9 rounded-full object-cover bg-[#222] shrink-0 border border-[#8B5E3C]/20" alt=""/>
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2a1e1b] to-black flex items-center justify-center text-xs font-bold text-[#C69C6D] shrink-0 border border-[#8B5E3C]/20">
                        {String(data[titleKey] || '?').charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#F5E6D3] whitespace-normal break-words leading-tight">
                        {String(data[titleKey] || 'Chưa đặt tên')}
                    </div>
                    {subCols?.[0] && (
                        <div className="text-[11px] text-[#A1887F] mt-1 whitespace-normal break-words leading-tight">
                            {String(data[subCols[0].key] || '')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const KanbanColumn = ({ id, title, count, children }: any) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div 
            ref={setNodeRef} 
            className="min-w-[280px] w-[280px] sm:w-[320px] flex-1 bg-[#110d0c] border border-[#8B5E3C]/20 rounded-xl flex flex-col h-full max-h-full shrink-0 shadow-lg"
        >
            <div className="p-3 border-b border-[#8B5E3C]/20 bg-[#1a120f] flex justify-between items-center rounded-t-xl sticky top-0 z-10">
                <span className="font-bold text-sm text-[#C69C6D] uppercase truncate max-w-[200px]" title={title}>
                    {title}
                </span>
                <span className="bg-[#C69C6D]/10 text-[10px] font-mono px-2 py-0.5 rounded text-[#C69C6D] font-bold border border-[#C69C6D]/20">
                    {count}
                </span>
            </div>

            <div className="p-2 space-y-2 flex-1 bg-[#0a0807]/50 overflow-y-auto custom-scroll">
                {children}
            </div>
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
    
    // Sensor cho DndKit (tránh conflict với click)
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const [isLevel3Open, setIsLevel3Open] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [userRole, setUserRole] = useState('user'); 
    const [isSyncing, setIsSyncing] = useState(false);

    // 1. Kiểm tra Quyền & Load Config
    useEffect(() => {
        const checkRole = () => {
            // Ưu tiên check admin cứng
            const laAdmin = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
            if (laAdmin) { 
                setUserRole('admin'); 
                return; 
            }

            // Check từ USER_INFO (được lưu ở CongDangNhap)
            const stored = localStorage.getItem('USER_INFO');
            if (stored) {
                try {
                    const u = JSON.parse(stored);
                    setUserRole(u.role || 'user');
                } catch(e) { 
                    setUserRole('user'); 
                }
            } else {
                // Fallback check USER_ROLE
                const roleOnly = localStorage.getItem('USER_ROLE');
                if (roleOnly) setUserRole(roleOnly);
            }
        };
        checkRole();

        if (isOpen && config.bangDuLieu) {
            setPage(1);
            fetchData(1);
            if(config.kieuHienThiList) setViewMode(config.kieuHienThiList as any);
            
            // Tự động tìm cột để group Kanban
            const defaultGroup = config.danhSachCot?.find(c => 
                ['status','trang_thai','vi_tri','position','loai','type'].some(k => c.key.toLowerCase().includes(k))
            )?.key;
            if(defaultGroup) setKanbanGroupBy(defaultGroup);
        }
    }, [isOpen, config]);

    // 2. Hàm lấy dữ liệu
    const fetchData = async (pageNumber: number) => {
        setLoading(true);
        try {
            const from = (pageNumber - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            
            let query = supabase.from(config.bangDuLieu).select('*', { count: 'exact' });
            
            if (search.trim()) {
                // Tìm cột tên hoặc cột đầu tiên để search
                const searchCol = config.danhSachCot?.find(c => c.key.toLowerCase().includes('ten'))?.key || config.danhSachCot?.[0]?.key || 'id';
                query = query.ilike(searchCol, `%${search}%`);
            }
            
            const { data: result, count, error } = await query.range(from, to);
            
            if (error) { 
                console.error(error); 
            } else { 
                setData(result || []); 
                setTotal(count || 0); 
            }
        } catch (err) { 
            console.error(err); 
        } finally { 
            setLoading(false); 
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= Math.ceil(total / ITEMS_PER_PAGE)) {
            setPage(newPage);
            fetchData(newPage);
        }
    };

    // 3. Các hàm xử lý hành động
    const handleOpenAdd = () => { 
        setSelectedItem(null); 
        setIsLevel3Open(true); 
    };
    
    const handleOpenDetail = (item: any) => { 
        setSelectedItem(item); 
        setIsLevel3Open(true); 
    };
    
    const handleLevel3Success = () => { 
        fetchData(page); 
    };

    const handleKanbanDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        
        const itemId = active.id as string;
        const newGroupValue = over.id as string;
        
        // Optimistic Update (Cập nhật UI ngay lập tức)
        const oldData = [...data];
        setData(prev => prev.map(item => String(item.id) === itemId ? { ...item, [kanbanGroupBy]: newGroupValue } : item));
        
        try {
            const { error } = await supabase.from(config.bangDuLieu).update({ [kanbanGroupBy]: newGroupValue }).eq('id', itemId);
            if (error) throw error;
        } catch (err) { 
            console.error("Lỗi update kanban:", err); 
            setData(oldData); // Revert nếu lỗi
        }
    };

    const handleSyncUsers = async () => {
        if (!confirm('Tiếp tục đồng bộ dữ liệu nhân sự?')) return;
        setIsSyncing(true);
        try {
            const res = await fetch('/api/sync-users', { method: 'POST' });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            alert(`Xong: Thêm ${result.added}, Sửa ${result.updated}, Xóa ${result.deleted}`);
        } catch (err: any) { 
            alert(`Lỗi: ${err.message}`); 
        } finally { 
            setIsSyncing(false); 
        }
    };

    if (!isOpen) return null;

    // Chuẩn bị columns
    let columns = config.danhSachCot?.filter(c => c.hienThiList) || [];
    if (columns.length === 0 && data.length > 0) {
        columns = Object.keys(data[0]).map(k => ({ key: k, label: k, kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true }));
    }
    
    const imgCol = columns.find(c => ['hinh_anh', 'avatar', 'image', 'picture', 'photo'].includes(c.key));
    const titleCol = columns[0] || { key: 'id', label: 'ID' };
    
    // Check quyền: Cho phép nhiều loại role admin
    const canEdit = ['admin', 'adminsystem', 'quanly', 'manager', 'admin_cung'].some(r => userRole.includes(r));

    // --- RENDERERS ---

    const renderTable = () => (
        <div className="w-full h-full overflow-auto bg-[#0a0807] custom-scroll">
            <table className="w-full text-sm text-[#A1887F] border-collapse min-w-[800px]">
                <thead className="bg-[#1a120f] text-xs uppercase font-bold text-[#C69C6D] sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-4 py-3 text-center border-b border-[#8B5E3C]/20 w-12 bg-[#1a120f]">#</th>
                        {columns.map(col => (
                            <th key={col.key} className="px-4 py-3 border-b border-[#8B5E3C]/20 text-left whitespace-nowrap bg-[#1a120f]">
                                {col.label}
                            </th>
                        ))}
                        <th className="px-4 py-3 border-b border-[#8B5E3C]/20 text-right bg-[#1a120f]">...</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#8B5E3C]/10">
                    {data.map((row, idx) => (
                        <tr key={idx} onClick={() => handleOpenDetail(row)} className="hover:bg-[#C69C6D]/10 cursor-pointer transition-colors">
                            <td className="px-4 py-3 text-center text-[#5D4037] font-mono text-xs">{(page-1)*ITEMS_PER_PAGE + idx + 1}</td>
                            {columns.map(col => {
                                const val = row[col.key];
                                if (['hinh_anh', 'avatar', 'image'].includes(col.key)) {
                                    return <td key={col.key} className="px-4 py-2"><img src={val} className="w-8 h-8 rounded-full border border-[#8B5E3C]/30 object-cover" alt=""/></td>
                                }
                                return <td key={col.key} className="px-4 py-3 truncate max-w-[200px] text-[#F5E6D3]">{String(val || '-')}</td>;
                            })}
                            <td className="px-4 py-3 text-right"><MoreHorizontal size={16} className="text-[#5D4037] inline"/></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderCard = () => (
        <div className="h-full overflow-auto custom-scroll p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.map((row, idx) => {
                    const imgUrl = imgCol ? row[imgCol.key] : null;
                    return (
                        <div key={idx} onClick={() => handleOpenDetail(row)} className="bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl hover:border-[#C69C6D] cursor-pointer group flex flex-col overflow-hidden relative shadow-sm h-fit transition-all duration-300">
                            <div className="w-full aspect-[16/9] bg-[#111] relative flex items-center justify-center overflow-hidden border-b border-[#8B5E3C]/10">
                                {imgUrl ? (
                                    <img src={imgUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e: any) => e.target.style.display='none'}/>
                                ) : (
                                    <ImageIcon size={32} className="text-[#5D4037]"/>
                                )}
                                {canEdit && (
                                    <button className="absolute top-2 right-2 p-1.5 bg-[#C69C6D] rounded-full text-[#1a120f] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                        <Edit size={12}/>
                                    </button>
                                )}
                            </div>
                            <div className="p-4 flex flex-col gap-1">
                                <h3 className="font-bold text-[#F5E6D3] text-sm truncate">{String(row[titleCol.key] || 'No Title')}</h3>
                                {columns[1] && <p className="text-xs text-[#A1887F] truncate">{String(row[columns[1].key] || '-')}</p>}
                                <div className="mt-3 pt-3 border-t border-[#8B5E3C]/10 flex flex-wrap gap-2">
                                    {columns.slice(2, 4).map(c => (
                                        <div key={c.key} className="text-[10px] text-[#8B5E3C] bg-[#2a1e1b] px-2 py-1 rounded truncate max-w-full">
                                            {String(row[c.key] || '-')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderKanban = () => {
        if (!kanbanGroupBy) return <div className="flex flex-col items-center justify-center h-full text-[#8B5E3C] gap-2"><Settings2/> Vui lòng chọn cột để phân nhóm Kanban.</div>;
        
        // Group Data
        const groups: Record<string, any[]> = {};
        data.forEach(row => { 
            const val = String(row[kanbanGroupBy] || 'Khác'); 
            if (!groups[val]) groups[val] = []; 
            groups[val].push(row); 
        });
        
        const sortedKeys = Object.keys(groups).sort();
        
        return (
            <DndContext sensors={sensors} onDragEnd={handleKanbanDragEnd}>
                <div className="flex gap-4 h-full p-4 items-start custom-scroll overflow-x-auto w-full">
                    {sortedKeys.map((groupName) => (
                        <KanbanColumn key={groupName} id={groupName} title={groupName} count={groups[groupName].length}>
                            {groups[groupName].map((row) => (
                                <KanbanCard 
                                    key={row.id} 
                                    id={String(row.id)} 
                                    data={row} 
                                    titleKey={titleCol.key} 
                                    subCols={columns.slice(1,3)} 
                                    imageCol={imgCol} 
                                    onClick={() => handleOpenDetail(row)}
                                />
                            ))}
                        </KanbanColumn>
                    ))}
                    <div className="w-4 shrink-0"></div> 
                </div>
            </DndContext>
        );
    };

    return (
        // 🟢 FIX VỊ TRÍ: bottom-[clamp(60px,15vw,80px)] để chừa MenuDuoi, Z-index 980
        <div className="fixed top-0 left-0 right-0 bottom-[clamp(60px,15vw,80px)] z-[980] flex flex-col bg-[#110d0c]/95 backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-300 border-b border-[#8B5E3C]/30 shadow-2xl">
             <style jsx>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: #1a120f; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #8B5E3C; border-radius: 4px; }
                .text-resp-title { font-size: clamp(16px, 5vw, 20px); }
            `}</style>

            {/* HEADER */}
            <div className="h-[clamp(60px,15vw,70px)] px-4 border-b border-[#8B5E3C]/20 flex items-center justify-between bg-gradient-to-r from-transparent via-[#8B5E3C]/10 to-transparent shrink-0">
                <div className="flex flex-col min-w-0">
                    <h2 className="text-resp-title font-bold text-[#C69C6D] uppercase tracking-wider truncate">{config.tenModule}</h2>
                    <p className="text-[10px] text-[#A1887F] font-mono truncate hidden sm:block">SRC: {config.bangDuLieu}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {/* Nút Sync chỉ hiện nếu là bảng nhan_su */}
                    {config.bangDuLieu === 'nhan_su' && canEdit && (
                        <button onClick={handleSyncUsers} disabled={isSyncing} className="flex items-center gap-2 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] shadow-lg transition-all disabled:opacity-50">
                            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} /> <span className="hidden sm:inline">Sync</span>
                        </button>
                    )}
                    {canEdit && (
                        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] rounded-full font-bold text-xs shadow-lg transition-all">
                            <Plus size={16}/> <span className="hidden sm:inline">THÊM</span>
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-[#8B5E3C] hover:text-[#C69C6D]"><X size={20}/></button>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="border-b border-[#8B5E3C]/20 bg-[#110d0c]/50 p-2 flex flex-wrap gap-2 items-center shrink-0">
                <div className="relative flex-1 min-w-[150px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5E3C]" size={14}/>
                    <input type="text" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchData(1)} className="w-full bg-[#1a120f] border border-[#8B5E3C]/30 rounded-full px-9 py-2 text-xs text-[#F5E6D3] focus:border-[#C69C6D] outline-none transition-all placeholder-[#5D4037]"/>
                </div>
                <div className="flex bg-[#1a120f] rounded-full border border-[#8B5E3C]/30 p-1 shrink-0">
                    {[ { id: 'table', icon: IconTable }, { id: 'card', icon: LayoutGrid }, { id: 'kanban', icon: IconKanban } ].map((m) => (
                        <button key={m.id} onClick={() => setViewMode(m.id as any)} className={`p-1.5 rounded-full transition-all ${viewMode===m.id ? 'bg-[#C69C6D] text-[#1a120f]' : 'text-[#8B5E3C] hover:text-[#C69C6D]'}`}><m.icon size={16}/></button>
                    ))}
                </div>
                {viewMode === 'kanban' && (
                    <div className="flex items-center gap-2 bg-[#1a120f] border border-[#8B5E3C]/30 rounded-full px-2 py-1 shrink-0">
                        <span className="text-[10px] text-[#A1887F] font-bold">Nhóm:</span>
                        <select value={kanbanGroupBy} onChange={(e) => setKanbanGroupBy(e.target.value)} className="bg-transparent text-xs text-[#C69C6D] font-bold outline-none cursor-pointer appearance-none pr-2">
                            {config.danhSachCot?.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden bg-[#0a0807] relative flex flex-col custom-scroll">
                {loading ? <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 gap-2"><Loader2 className="animate-spin text-[#C69C6D]" size={32}/><span className="text-[#A1887F] text-xs">Loading...</span></div> : null}
                
                {data.length === 0 && !loading ? <div className="flex-1 flex flex-col items-center justify-center text-[#5D4037]"><Search size={40} className="mb-2 opacity-30"/><span className="text-sm">Không tìm thấy dữ liệu.</span></div> : (
                    <div className="h-full w-full overflow-hidden">
                        {viewMode === 'table' && renderTable()}
                        {viewMode === 'card' && renderCard()}
                        {viewMode === 'kanban' && renderKanban()}
                    </div>
                )}
            </div>

            {/* BOTTOM NAV BAR (Phân trang & Điều hướng) */}
            <div className="h-[60px] bg-[#110d0c] border-t border-[#8B5E3C]/30 flex items-center justify-between px-6 shrink-0 shadow-lg relative z-50">
                 <button onClick={onClose} className="p-2 rounded-full text-[#8B5E3C] hover:text-[#C69C6D] hover:bg-white/5 transition-all active:scale-90"><ArrowLeft size={24} strokeWidth={2} /></button>
                 
                 <div className="flex items-center gap-2">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="p-2 text-[#8B5E3C] disabled:opacity-30 hover:text-white transition-colors"><ChevronLeft/></button>
                    <span className="text-xs font-mono text-[#F5E6D3] bg-[#1a120f] px-3 py-1 rounded border border-[#8B5E3C]/20">{page} / {Math.max(1, Math.ceil(total/ITEMS_PER_PAGE))}</span>
                    <button onClick={() => handlePageChange(page + 1)} disabled={page * ITEMS_PER_PAGE >= total} className="p-2 text-[#8B5E3C] disabled:opacity-30 hover:text-white transition-colors"><ChevronRight/></button>
                 </div>

                 <button className="p-2 rounded-full text-[#8B5E3C]/30 cursor-not-allowed"><ArrowRight size={24} strokeWidth={2} /></button>
            </div>

            <Level3_FormChiTiet isOpen={isLevel3Open} onClose={() => setIsLevel3Open(false)} onSuccess={handleLevel3Success} config={config} initialData={selectedItem} userRole={userRole}/>
        </div>
    );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
// 🟢 ĐÃ SỬA: Xóa Trash2, ShieldCheck thừa đi
import { Plus, Search, QrCode, X, Loader2, ArrowUpDown, PlusCircle, GripHorizontal, Check } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule';
import ModuleItem from './ModuleItem';
import ModalTaoModule from './ModalTaoModule';
import MenuDuoi from './MenuDuoi';
import Level3_FormChiTiet from './Level3_FormChiTiet'; 
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

interface Props {
    pageId?: string; 
}

export default function DashboardBuilder({ pageId = 'home' }: Props) {
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    
    // Config & State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<ModuleConfig | null>(null);
    const [activeRowId, setActiveRowId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Search & Detail
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [detailItem, setDetailItem] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailConfig, setDetailConfig] = useState<ModuleConfig | any>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

    // CHECK QUYỀN
    const checkUserRole = () => {
        if (typeof window === 'undefined') return;
        const laAdminCung = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
        if (laAdminCung) { setIsAdmin(true); return; }

        const rawRole = localStorage.getItem('USER_ROLE') || '';
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "");
        const normalizedRole = normalize(rawRole);
        const allowedRoles = ['admin', 'quanly', 'manager', 'sep', 'boss'];

        setIsAdmin(allowedRoles.includes(normalizedRole));
    };

    // LOAD DATA
    useEffect(() => {
        checkUserRole();
        const load = async () => {
            const { data } = await supabase.from('cau_hinh_modules').select('*').eq('page_id', pageId).order('created_at', { ascending: true });
            if (data) setModules(data.map((row: any) => ({ ...row.config_json, id: row.module_id })));
        };
        load();
        
        const handleClickOutside = (event: any) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) setShowDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [pageId]);

    // SEARCH LOGIC
    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchTerm.length < 2) { setSearchResults([]); return; }
            setIsSearching(true); setShowDropdown(true);
            try {
                const { data, error } = await supabase.from('nhan_su').select('*').or(`ten_hien_thi.ilike.%${searchTerm}%,sdt.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`).limit(5);
                if (!error && data) setSearchResults(data);
            } catch (error) { console.error(error); } finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    // CLICK KẾT QUẢ TÌM KIẾM
    const handleResultClick = (item: any) => {
        const fakeConfig: ModuleConfig = {
            id: 'search_view', tenModule: 'Thông tin chi tiết', bangDuLieu: 'nhan_su', version: '1', updatedAt: '', 
            danhSachCot: [
                { key: 'hinh_anh', label: 'Ảnh đại diện', kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true },
                { key: 'ten_hien_thi', label: 'Tên hiển thị', kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true, batBuoc: true },
                { key: 'sdt', label: 'Số điện thoại', kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true },
                { key: 'email', label: 'Email', kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true },
                { key: 'vi_tri', label: 'Vị trí', kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true },
            ]
        };
        setDetailConfig(fakeConfig);
        setDetailItem(item);
        setIsDetailOpen(true);
        setShowDropdown(false);
    };

    // --- LOGIC HÀNG (ROWS) ---
    const rows: Record<string, ModuleConfig[]> = {};
    const rowHeights: Record<string, number> = {};
    const uniqueRowIds = Array.from(new Set(modules.map(m => m.rowId || 'default')));
    
    uniqueRowIds.forEach(rid => {
        rows[rid] = modules.filter(m => (m.rowId || 'default') === rid);
        rowHeights[rid] = rows[rid][0]?.rowHeight || 250;
    });

    const handleCreateNewRow = () => {
        if (!isAdmin) return;
        const newRowId = `row_${Date.now()}`;
        setActiveRowId(newRowId);
        setEditingModule(null);
        setIsModalOpen(true);
    };

    const handleAddToExistingRow = (rowId: string) => {
        if (!isAdmin) return;
        setActiveRowId(rowId);
        setEditingModule(null);
        setIsModalOpen(true);
    };

    const handleSaveModule = async (config: ModuleConfig) => {
        if (!isAdmin) return;
        let updatedModules = [...modules];
        const idx = modules.findIndex(m => m.id === config.id);
        const targetRowId = idx >= 0 ? (config.rowId || 'default') : (activeRowId || 'default');
        const currentHeight = rowHeights[targetRowId] || 250;

        const newConfig = { 
            ...config, 
            rowId: targetRowId,
            rowHeight: currentHeight,
            doRong: config.doRong || 1,
            page_id: pageId
        };

        if (idx >= 0) updatedModules[idx] = newConfig;
        else updatedModules.push(newConfig);
        
        setModules(updatedModules);
        setActiveRowId(null);

        const { error } = await supabase.from('cau_hinh_modules').upsert({ module_id: newConfig.id, page_id: pageId, config_json: newConfig });
        if (error) console.error("Lỗi lưu Supabase:", error);
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        if(!confirm('Xóa module này?')) return;
        setModules(prev => prev.filter(m => m.id !== id));
        await supabase.from('cau_hinh_modules').delete().eq('module_id', id);
    };

    const handleResizeWidth = (id: string, delta: number) => {
        if (!isAdmin) return;
        setModules(prev => prev.map(m => {
            if (m.id !== id) return m;
            const newW = Math.max(1, Math.min(2, (m.doRong || 1) + delta));
            supabase.from('cau_hinh_modules').update({ config_json: { ...m, doRong: newW } }).eq('module_id', id).then();
            return { ...m, doRong: newW };
        }));
    };

    const handleResizeRowHeight = (rowId: string, delta: number) => {
        if (!isAdmin) return;
        const currentH = rowHeights[rowId] || 250;
        const newH = Math.max(150, Math.min(600, currentH + delta));
        
        setModules(prev => prev.map(m => {
            if ((m.rowId || 'default') === rowId) {
                const updated = { ...m, rowHeight: newH };
                supabase.from('cau_hinh_modules').update({ config_json: updated }).eq('module_id', m.id).then();
                return updated;
            }
            return m;
        }));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        if (!isAdmin) return;
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setModules((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#111111] text-white w-full pb-32 font-sans">
            
            {/* HEADER */}
            <div className="fixed top-0 left-0 right-0 z-[900] bg-[#1A1A1A] h-16 flex items-center justify-between px-3 md:px-4 shadow-md border-b border-white/5 pt-safe">
                <span className="font-black text-sm tracking-[0.1em] text-[#C69C6D] uppercase truncate hidden sm:block">NGHIEM'S ART</span>
                                         
                <div className="flex-1 flex justify-center px-2 md:px-4 relative" ref={searchRef}>
                    <div className="w-full max-w-xl relative">
                        <div className="flex items-center gap-2 bg-[#111] rounded-full px-3 md:px-4 py-2 text-sm text-gray-400 group border border-white/5 focus-within:border-[#C69C6D]/50 transition-all shadow-inner">
                            <Search size={18} className="text-gray-500 group-focus-within:text-[#C69C6D] shrink-0" />
                            <input type="text" placeholder="Tìm kiếm..." className="bg-transparent border-none outline-none w-full placeholder-gray-600 text-white text-xs md:text-sm min-w-[50px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => { if(searchTerm) setShowDropdown(true); }}/>
                            {isSearching ? <Loader2 size={16} className="animate-spin text-[#C69C6D] shrink-0"/> : searchTerm && <button onClick={() => setSearchTerm('')}><X size={16} className="text-gray-500 hover:text-white shrink-0"/></button>}
                        </div>
                        {showDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[910] max-h-80 overflow-y-auto custom-hover-scroll">
                                {searchResults.length > 0 ? (
                                    <div>
                                        <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-500 bg-[#111]">Kết quả</div>
                                        {searchResults.map((item) => (
                                            <div key={item.id} onClick={() => handleResultClick(item)} className="flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] cursor-pointer border-b border-white/5 last:border-0 transition-colors">
                                                {item.hinh_anh ? <img src={item.hinh_anh} className="w-9 h-9 rounded-full object-cover bg-[#222]" alt=""/> : <div className="w-9 h-9 rounded-full bg-[#3E2723] flex items-center justify-center text-[#C69C6D] font-bold text-xs">{(item.ten_hien_thi || '?').charAt(0)}</div>}
                                                <div className="min-w-0"><div className="text-sm font-bold text-white truncate">{item.ten_hien_thi || 'No Name'}</div><div className="text-[11px] text-gray-500 truncate">{item.sdt || item.vi_tri}</div></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="p-4 text-center text-gray-500 text-xs">Không tìm thấy kết quả.</div>}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 md:gap-3 shrink-0 md:w-48 text-gray-400">
                    {isAdmin && (
                        <div className="flex items-center gap-1 text-[#4CAF50] bg-[#4CAF50]/10 px-2 py-1 rounded-full border border-[#4CAF50]/20 mr-2 animate-pulse">
                            <Check size={14} /> 
                            <span className="text-[9px] font-bold uppercase hidden md:block">Đã lưu</span>
                        </div>
                    )}
                    <button className="hover:text-white transition-colors"><QrCode size={20} strokeWidth={1.5}/></button>
                </div>
            </div>

            {/* BODY */}
            <div className="pt-20 px-2 md:px-4 space-y-2"> 
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    {uniqueRowIds.map(rowId => {
                        const rowModules = rows[rowId];
                        const h = rowHeights[rowId]; 
                        return (
                            <div key={rowId} className="relative group/row">
                                {isAdmin && (
                                    <div className="absolute -top-7 left-0 right-0 flex justify-between items-center px-1 z-20 transition-opacity opacity-100 md:opacity-0 md:group-hover/row:opacity-100">
                                        <div className="flex items-center gap-2">
                                            <GripHorizontal size={16} className="text-gray-600 cursor-grab"/>
                                            <span className="text-[10px] font-bold text-gray-600 uppercase">H: {h}px</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-[#1A1A1A] border border-white/10 rounded-t-lg px-2 py-1 shadow-lg">
                                            <button onClick={() => handleAddToExistingRow(rowId)} className="p-1 text-blue-500 hover:text-blue-400 hover:bg-white/5 rounded transition-colors" title="Thêm vào hàng này"><Plus size={14} /></button>
                                            <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
                                            <button onClick={() => handleResizeRowHeight(rowId, -50)} className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded"><ArrowUpDown size={12} className="rotate-45"/></button>
                                            <button onClick={() => handleResizeRowHeight(rowId, 50)} className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded"><ArrowUpDown size={12}/></button>
                                        </div>
                                    </div>
                                )}
                                <div className="border border-transparent hover:border-white/5 rounded-xl transition-colors">
                                    <SortableContext items={rowModules.map(m => m.id)} strategy={rectSortingStrategy}>
                                        <div className="grid w-full transition-all duration-300 grid-flow-row-dense" style={{ gridTemplateColumns: `repeat(1, 1fr)`, gridAutoRows: `${h}px`, gap: '8px' } as React.CSSProperties}>
                                            <style jsx>{` @media (min-width: 768px) { div.grid { grid-template-columns: repeat(2, 1fr) !important; } } `}</style>
                                            {rowModules.map(mod => (
                                                <ModuleItem key={mod.id} id={mod.id} data={mod} isAdmin={isAdmin} onDelete={() => handleDelete(mod.id)} onEdit={() => { setEditingModule(mod); setIsModalOpen(true); }} onResizeWidth={(delta) => handleResizeWidth(mod.id, delta)}/>
                                            ))}
                                        </div>
                                    </SortableContext>
                                </div>
                            </div>
                        );
                    })}
                </DndContext>

                {isAdmin && (
                    <div className="flex justify-center pb-10 pt-4 border-t border-dashed border-white/5">
                        <button onClick={handleCreateNewRow} className="flex items-center gap-3 px-8 py-3 bg-[#1A1A1A] hover:bg-[#222] border border-white/10 hover:border-[#C69C6D]/50 rounded-full shadow-lg transition-all active:scale-95 group">
                            <PlusCircle size={20} className="text-[#C69C6D] group-hover:scale-110 transition-transform"/>
                            <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-widest">Tạo Hàng Lưới Mới</span>
                        </button>
                    </div>
                )}
            </div>

            <ModalTaoModule isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveModule} initialConfig={editingModule} pageId={pageId}/>
            <MenuDuoi onAdd={isAdmin ? handleCreateNewRow : undefined} /> 
            
            {isDetailOpen && detailConfig && (
                <Level3_FormChiTiet isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} onSuccess={() => {}} config={detailConfig} initialData={detailItem} userRole={isAdmin ? 'admin' : 'user'}/>
            )}
        </div>
    );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, QrCode, X, Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule';
import ModuleItem from './ModuleItem';
import ModalTaoModule from './ModalTaoModule';
import MenuDuoi from './MenuDuoi'; // 🟢 Import Menu Dưới
import Level3_FormChiTiet from './Level3_FormChiTiet'; 
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

interface Props {
    pageId?: string; 
}

export default function DashboardBuilder({ pageId = 'home' }: Props) {
    const [globalConfig] = useState({ tabletCols: 4, baseRowHeight: 50 });
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    
    // STATE MODAL
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<ModuleConfig | null>(null);

    // STATE SEARCH
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // STATE DETAIL
    const [detailItem, setDetailItem] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailConfig, setDetailConfig] = useState<ModuleConfig | any>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

    // LOAD MODULES
    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from('cau_hinh_modules')
                .select('*')
                .eq('page_id', pageId) 
                .order('created_at', { ascending: true });
            
            if (data) setModules(data.map((row: any) => ({ ...row.config_json, id: row.module_id })));
        };
        load();

        const handleClickOutside = (event: any) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [pageId]);

    // SEARCH LOGIC
    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchTerm.length < 2) { setSearchResults([]); return; }
            setIsSearching(true);
            setShowDropdown(true);
            try {
                // TÌM KIẾM TRONG BẢNG NHAN_SU (MẪU)
                const { data, error } = await supabase
                    .from('nhan_su') 
                    .select('*')
                    .or(`ten_hien_thi.ilike.%${searchTerm}%,sdt.ilike.%${searchTerm}%`)
                    .limit(5);
                if (!error && data) setSearchResults(data);
            } catch (error) { console.error(error); } 
            finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const handleResultClick = (item: any) => {
        const fakeConfig: ModuleConfig = {
            id: 'search_view', tenModule: 'Thông tin', bangDuLieu: 'nhan_su', version: '1', updatedAt: '', 
            danhSachCot: [
                { key: 'hinh_anh', label: 'Ảnh đại diện', kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true },
                { key: 'ten_hien_thi', label: 'Tên hiển thị', kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true, batBuoc: true },
                { key: 'sdt', label: 'Số điện thoại', kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true },
                { key: 'vi_tri', label: 'Vị trí', kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true },
            ]
        };
        setDetailConfig(fakeConfig);
        setDetailItem(item);
        setIsDetailOpen(true);
        setShowDropdown(false);
    };

    // DND Logic ... (Giữ nguyên)
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setModules((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };
    const handleSaveModule = (config: ModuleConfig) => {
        setModules(prev => {
            const idx = prev.findIndex(m => m.id === config.id);
            const newConfig = { ...config, doCao: config.doCao || 5 };
            return idx >= 0 ? prev.map((m, i) => i === idx ? newConfig : m) : [...prev, newConfig];
        });
    };
    const handleDelete = async (id: string) => {
        if(!confirm('Xóa module này?')) return;
        setModules(prev => prev.filter(m => m.id !== id));
        await supabase.from('cau_hinh_modules').delete().eq('module_id', id);
    };
    const handleResizeHeight = (id: string, delta: number) => {
        setModules(prev => prev.map(m => {
            if (m.id !== id) return m;
            const newH = Math.max(2, Math.min(20, (m.doCao || 5) + delta));
            supabase.from('cau_hinh_modules').update({ config_json: { ...m, doCao: newH } }).eq('module_id', id);
            return { ...m, doCao: newH };
        }));
    };

    return (
        <div className="min-h-screen bg-[#111111] text-white w-full pb-20">
            
            {/* 🟢 HEADER DARKMODE - NGHIEM'S ART */}
            <div className="sticky top-0 z-50 bg-[#1A1A1A] h-14 flex items-center justify-between px-4 shadow-md border-b border-white/5 pt-safe">
                
                {/* 1. TÌM KIẾM (Bên trái) */}
                <div className="flex-1 max-w-sm relative mr-2" ref={searchRef}>
                    <div className="flex items-center gap-2 bg-[#111] rounded-lg px-3 py-1.5 text-sm text-gray-400 group border border-white/5 focus-within:border-blue-500/50 transition-colors">
                        <Search size={16} className="text-gray-500 group-focus-within:text-blue-500" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm..." 
                            className="bg-transparent border-none outline-none w-full placeholder-gray-600 text-white text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => { if(searchTerm) setShowDropdown(true); }}
                        />
                        {isSearching && <Loader2 size={14} className="animate-spin text-blue-500"/>}
                    </div>

                    {/* DROPDOWN */}
                    {showDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl overflow-hidden z-[910] max-h-60 overflow-y-auto">
                            {searchResults.length > 0 ? (
                                <div>
                                    {searchResults.map((item) => (
                                        <div key={item.id} onClick={() => handleResultClick(item)} className="flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] cursor-pointer border-b border-white/5 last:border-0">
                                            <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-500 font-bold text-xs">{(item.ten_hien_thi || '?').charAt(0)}</div>
                                            <div>
                                                <div className="text-xs font-bold text-white">{item.ten_hien_thi}</div>
                                                <div className="text-[10px] text-gray-500">{item.sdt}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 text-center text-gray-500 text-xs">Không tìm thấy.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. LOGO GIỮA HOẶC PHẢI (NGHIEM'S ART) */}
                <div className="font-black text-sm tracking-widest text-[#0091FF] uppercase truncate">
                    NGHIEM'S ART
                </div>

                {/* 3. NÚT CHỨC NĂNG (QR + TẠO MỚI) */}
                <div className="flex items-center gap-3 ml-3 shrink-0">
                    <button className="text-gray-400 hover:text-white"><QrCode size={20}/></button>
                    <button 
                        onClick={() => { setEditingModule(null); setIsModalOpen(true); }}
                        className="text-gray-400 hover:text-white"
                        title="Thêm Module"
                    >
                        <Plus size={24}/>
                    </button>
                </div>
            </div>

            {/* GRID MODULE */}
            <div className="p-2 pt-4"> 
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={modules.map(m => m.id)} strategy={rectSortingStrategy}>
                        <div className="grid w-full transition-all duration-300 grid-flow-row-dense" style={{ gridTemplateColumns: `repeat(1, 1fr)`, gridAutoRows: `${globalConfig.baseRowHeight}px`, gap: 10 } as React.CSSProperties}>
                            <style jsx>{` @media (min-width: 768px) { div.grid { grid-template-columns: repeat(${globalConfig.tabletCols}, 1fr) !important; } } `}</style>
                            {modules.map(mod => (
                                <ModuleItem key={mod.id} id={mod.id} data={mod} isAdmin={true} onDelete={() => handleDelete(mod.id)} onEdit={() => { setEditingModule(mod); setIsModalOpen(true); }} onResizeHeight={(delta) => handleResizeHeight(mod.id, delta)}/>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* MODALS */}
            <ModalTaoModule isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveModule} initialConfig={editingModule} pageId={pageId}/>
            {isDetailOpen && detailConfig && <Level3_FormChiTiet isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} onSuccess={() => {}} config={detailConfig} initialData={detailItem} userRole={'admin'}/>}
            
            {/* MENU DƯỚI (Trong DashboardBuilder) */}
            <MenuDuoi />
        </div>
    );
}
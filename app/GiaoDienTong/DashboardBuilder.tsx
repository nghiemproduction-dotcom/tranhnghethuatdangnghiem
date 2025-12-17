'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, QrCode, X, Loader2, Bell, MessageCircle } from 'lucide-react';
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
                const { data, error } = await supabase
                    .from('nhan_su') 
                    .select('*')
                    .or(`ten_hien_thi.ilike.%${searchTerm}%,sdt.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
                    .limit(5);
                if (!error && data) setSearchResults(data);
            } catch (error) { console.error(error); } 
            finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

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

    // DND Logic
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
        <div className="min-h-screen bg-[#111111] text-white w-full pb-24 font-sans">
            
            {/* HEADER CỐ ĐỊNH */}
            <div className="fixed top-0 left-0 right-0 z-[900] bg-[#1A1A1A] h-16 flex items-center justify-between px-4 shadow-md border-b border-white/5 pt-safe transition-all duration-300">
                
                {/* 1. LOGO & TÊN */}
                <div className="flex items-center gap-2 w-48 shrink-0">
                    <div className="w-8 h-8 bg-[#3E2723] rounded flex items-center justify-center font-black text-[#A1887F]">AS</div>
                    <span className="font-black text-sm tracking-[0.1em] text-[#C69C6D] uppercase truncate hidden sm:block">
                        NGHIEM'S ART
                    </span>
                </div>

                {/* 2. THANH TÌM KIẾM */}
                <div className="flex-1 flex justify-center px-4 relative" ref={searchRef}>
                    <div className="w-full max-w-xl relative">
                        <div className="flex items-center gap-2 bg-[#111] rounded-full px-4 py-2 text-sm text-gray-400 group border border-white/5 focus-within:border-[#C69C6D]/50 transition-all shadow-inner">
                            <Search size={18} className="text-gray-500 group-focus-within:text-[#C69C6D]" />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm..." 
                                className="bg-transparent border-none outline-none w-full placeholder-gray-600 text-white text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => { if(searchTerm) setShowDropdown(true); }}
                            />
                            {isSearching ? (
                                <Loader2 size={16} className="animate-spin text-[#C69C6D]"/>
                            ) : searchTerm && (
                                <button onClick={() => setSearchTerm('')}><X size={16} className="text-gray-500 hover:text-white"/></button>
                            )}
                        </div>

                        {/* DROPDOWN KẾT QUẢ */}
                        {showDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[910] max-h-80 overflow-y-auto custom-hover-scroll">
                                {searchResults.length > 0 ? (
                                    <div>
                                        <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-500 bg-[#111]">Kết quả</div>
                                        {searchResults.map((item) => (
                                            <div key={item.id} onClick={() => handleResultClick(item)} className="flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] cursor-pointer border-b border-white/5 last:border-0 transition-colors">
                                                {item.hinh_anh ? (
                                                    <img src={item.hinh_anh} className="w-9 h-9 rounded-full object-cover bg-[#222]" alt=""/>
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-[#3E2723] flex items-center justify-center text-[#C69C6D] font-bold text-xs">{(item.ten_hien_thi || '?').charAt(0)}</div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-bold text-white">{item.ten_hien_thi || 'No Name'}</div>
                                                    <div className="text-[11px] text-gray-500">{item.sdt || item.vi_tri}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500 text-xs">Không tìm thấy kết quả.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. NÚT CHỨC NĂNG */}
                <div className="flex items-center justify-end gap-3 w-48 shrink-0 text-gray-400">
                    <button className="hover:text-white transition-colors" title="Quét QR">
                        <QrCode size={20} strokeWidth={1.5}/>
                    </button>
                    <button 
                        onClick={() => { setEditingModule(null); setIsModalOpen(true); }}
                        className="w-8 h-8 rounded-full bg-[#333] hover:bg-[#C69C6D] hover:text-[#1A1A1A] flex items-center justify-center transition-all shadow-sm active:scale-95"
                        title="Thêm Module"
                    >
                        <Plus size={20}/>
                    </button>
                </div>
            </div>

            {/* GRID MODULE */}
            <div className="pt-20 px-2 md:px-4"> 
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={modules.map(m => m.id)} strategy={rectSortingStrategy}>
                        <div className="grid w-full transition-all duration-300 grid-flow-row-dense" style={{ gridTemplateColumns: `repeat(1, 1fr)`, gridAutoRows: `${globalConfig.baseRowHeight}px`, gap: 12 } as React.CSSProperties}>
                            <style jsx>{` @media (min-width: 768px) { div.grid { grid-template-columns: repeat(${globalConfig.tabletCols}, 1fr) !important; } } `}</style>
                            {modules.map(mod => (
                                <ModuleItem 
                                    key={mod.id} 
                                    id={mod.id} 
                                    data={mod} 
                                    isAdmin={true}
                                    onDelete={() => handleDelete(mod.id)}
                                    onEdit={() => { setEditingModule(mod); setIsModalOpen(true); }}
                                    // 🟢 ĐÃ SỬA LỖI Ở ĐÂY: onResizeHeight -> onResize
                                    onResize={(delta: number) => handleResizeHeight(mod.id, delta)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            <ModalTaoModule isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveModule} initialConfig={editingModule} pageId={pageId}/>
            <MenuDuoi onAdd={() => { setEditingModule(null); setIsModalOpen(true); }} />
            
            {isDetailOpen && detailConfig && (
                <Level3_FormChiTiet isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} onSuccess={() => {}} config={detailConfig} initialData={detailItem} userRole={'admin'}/>
            )}
        </div>
    );
}
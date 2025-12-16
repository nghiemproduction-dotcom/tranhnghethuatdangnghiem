'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Layers } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule';
import ModuleItem from './ModuleItem';
import ModalTaoModule from './ModalTaoModule';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

// 🟢 NHẬN PAGE ID TỪ PROPS
interface Props {
    pageId?: string; // Mặc định là 'home'
}

export default function DashboardBuilder({ pageId = 'home' }: Props) {
    const [globalConfig] = useState({ 
        tabletCols: 4,  
        baseRowHeight: 50  
    });

    const [modules, setModules] = useState<ModuleConfig[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<ModuleConfig | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

    useEffect(() => {
        const load = async () => {
            // 🟢 LỌC THEO PAGE_ID
            const { data } = await supabase
                .from('cau_hinh_modules')
                .select('*')
                .eq('page_id', pageId) 
                .order('created_at', { ascending: true });
            
            if (data) setModules(data.map((row: any) => ({ ...row.config_json, id: row.module_id })));
        };
        load();
    }, [pageId]); // Reload khi đổi trang

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
            const newHeightSpan = Math.max(2, Math.min(20, (m.doCao || 5) + delta));
            const updatedModule = { ...m, doCao: newHeightSpan };
            
            supabase.from('cau_hinh_modules')
                .update({ config_json: updatedModule })
                .eq('module_id', id)
                .then(res => { if(res.error) console.error("Lỗi lưu chiều cao:", res.error) });

            return updatedModule;
        }));
    };

    return (
        <div className="min-h-screen bg-black text-white w-full pb-40">
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10 px-4 h-12 flex items-center justify-between">
                <div className="font-bold text-xs tracking-widest text-gray-500 uppercase flex items-center gap-2">
                    <Layers size={14} className="text-blue-600"/> {pageId === 'home' ? 'Dashboard' : `Page: ${pageId}`}
                </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={modules.map(m => m.id)} strategy={rectSortingStrategy}>
                    <div 
                        className="grid w-full transition-all duration-300 grid-flow-row-dense" 
                        style={{
                            gridTemplateColumns: `repeat(1, 1fr)`,
                            gridAutoRows: `${globalConfig.baseRowHeight}px`,
                            gap: 0 
                        } as React.CSSProperties}
                    >
                        <style jsx>{`
                            @media (min-width: 768px) {
                                div.grid { grid-template-columns: repeat(${globalConfig.tabletCols}, 1fr) !important; }
                            }
                        `}</style>

                        {modules.map(mod => (
                            <ModuleItem 
                                key={mod.id} 
                                id={mod.id} 
                                data={mod} 
                                isAdmin={true}
                                onDelete={() => handleDelete(mod.id)}
                                onEdit={() => { setEditingModule(mod); setIsModalOpen(true); }}
                                onResizeHeight={(delta) => handleResizeHeight(mod.id, delta)}
                            />
                        ))}

                        <button 
                            onClick={() => { setEditingModule(null); setIsModalOpen(true); }}
                            className="flex flex-col items-center justify-center bg-[#050505] hover:bg-[#111] border-r border-b border-white/10 group transition-all md:col-span-1 md:row-span-5 min-h-[250px]"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all mb-2 border border-white/5">
                                <Plus size={20} className="text-gray-600 group-hover:text-white"/>
                            </div>
                            <span className="text-[9px] font-bold text-gray-600 group-hover:text-white uppercase tracking-widest">Thêm Module</span>
                        </button>

                    </div>
                </SortableContext>
            </DndContext>

            {/* 🟢 TRUYỀN PAGE ID VÀO MODAL */}
            <ModalTaoModule 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveModule} 
                initialConfig={editingModule}
                pageId={pageId} 
            />
        </div>
    );
}
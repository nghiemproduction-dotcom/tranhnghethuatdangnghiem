'use client';
import React, { useState, useEffect } from 'react';
import { 
    DndContext, closestCorners, useSensor, useSensors, PointerSensor, 
    KeyboardSensor, DragEndEvent, DragOverEvent, 
    DragOverlay, defaultDropAnimationSideEffects 
} from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Plus, GripHorizontal, Trash2, ArrowUpDown, PlusCircle } from 'lucide-react';
import { ModuleConfig } from './KieuDuLieuModule';
import ModuleItem from '@/app/GiaoDienTong/ModuleItem'; // 🟢 Giữ nguyên import theo file bạn gửi

interface Props {
    modules: ModuleConfig[];
    isAdmin: boolean;
    onChange: (newModules: ModuleConfig[]) => void;
    onEditModule: (id: string) => void;
    onDeleteModule: (id: string) => void;
    onResizeWidth: (id: string, delta: number) => void;
    onOpenDetail?: (item: any, config: ModuleConfig) => void;
    onLevel2Toggle?: (isOpen: boolean) => void;
    onAddModuleToRow: (rowId: string) => void;
    forceHidden?: boolean;
}

export default function GridArea({ 
    modules, isAdmin, onChange, 
    onEditModule, onDeleteModule, onResizeWidth, 
    onOpenDetail, onLevel2Toggle, onAddModuleToRow, forceHidden 
}: Props) {
    
    if (forceHidden) return null;

    const [rowIds, setRowIds] = useState<string[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const activeModule = modules.find(m => m.id === activeId);

    useEffect(() => {
        const existingRows = Array.from(new Set(modules.map(m => m.rowId || 'row_default')));
        if (existingRows.length === 0 && modules.length === 0) {
            setRowIds(['row_default']);
        } else {
            setRowIds(prev => {
                const combined = new Set([...prev, ...existingRows]);
                return Array.from(combined);
            });
        }
    }, [modules]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const findContainer = (id: string) => {
        if (rowIds.includes(id)) return id;
        return modules.find(m => m.id === id)?.rowId;
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id as string;
        const overId = over.id as string;
        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) return;

        const activeItem = modules.find(m => m.id === activeId);
        if (activeItem) {
            const updatedModules = modules.map(m => {
                if (m.id === activeId) return { ...m, rowId: overContainer };
                return m;
            });
            onChange(updatedModules);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;
        const activeId = active.id as string;
        const overId = over.id as string;
        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (activeContainer && overContainer && activeContainer === overContainer) {
            const activeIndex = modules.findIndex(m => m.id === activeId);
            const overIndex = modules.findIndex(m => m.id === overId);
            if (activeIndex !== overIndex) onChange(arrayMove(modules, activeIndex, overIndex));
        }
    };

    const handleAddRow = () => setRowIds(prev => [...prev, `row_${Date.now()}`]);
    const handleDeleteRow = (rowId: string) => {
        if (modules.some(m => m.rowId === rowId)) return alert("Hàng này đang có module. Vui lòng xóa module trước.");
        setRowIds(prev => prev.filter(r => r !== rowId));
    };
    const handleResizeRowHeight = (rowId: string, delta: number) => {
        onChange(modules.map(m => m.rowId === rowId ? { ...m, rowHeight: Math.max(200, (m.rowHeight || 400) + delta) } : m));
    };

    return (
        // 🟢 Padding tổng thể nhỏ (p-2) để tối ưu diện tích
        <div className="w-full min-h-screen p-2 pb-40 space-y-2"> 
            <DndContext 
                sensors={sensors} collisionDetection={closestCorners} 
                onDragStart={(e) => setActiveId(e.active.id as string)}
                onDragOver={handleDragOver} onDragEnd={handleDragEnd}
            >
                {rowIds.map((rowId) => {
                    const rowModules = modules.filter(m => (m.rowId || 'row_default') === rowId);
                    const rowHeight = rowModules[0]?.rowHeight || 400;

                    return (
                        // 🟢 ĐÃ XÓA SẠCH: border, rounded, bg, p-4
                        // Chỉ giữ lại group/row để hiện tool và relative để định vị
                        <div key={rowId} className="group/row relative transition-all py-1">
                            
                            {/* THANH CÔNG CỤ HÀNG (Floating) */}
                            {isAdmin && (
                                <div className="absolute -top-4 left-0 flex items-center gap-2 bg-[#1a120f] px-2 py-1 z-30 opacity-0 group-hover/row:opacity-100 transition-opacity pointer-events-none group-hover/row:pointer-events-auto">
                                    <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-wider flex items-center gap-1 cursor-grab active:cursor-grabbing">
                                        <GripHorizontal size={12}/> {rowId}
                                    </span>
                                    <div className="h-3 w-[1px] bg-[#8B5E3C]/30 mx-1"></div>
                                    <button onClick={() => handleResizeRowHeight(rowId, -50)} className="hover:text-white text-[#8B5E3C]"><ArrowUpDown size={12}/></button>
                                    <span className="text-[9px] text-[#5D4037] w-8 text-center">{rowHeight}px</span>
                                    <button onClick={() => handleResizeRowHeight(rowId, 50)} className="hover:text-white text-[#8B5E3C]"><ArrowUpDown size={12}/></button>
                                    <div className="h-3 w-[1px] bg-[#8B5E3C]/30 mx-1"></div>
                                    <button onClick={() => onAddModuleToRow(rowId)} className="flex items-center gap-1 hover:text-[#C69C6D] text-[#8B5E3C] transition-colors">
                                        <PlusCircle size={12}/> <span className="text-[9px] font-bold">THÊM</span>
                                    </button>
                                    {rowModules.length === 0 && (
                                        <>
                                            <div className="h-3 w-[1px] bg-[#8B5E3C]/30 mx-1"></div>
                                            <button onClick={() => handleDeleteRow(rowId)} className="hover:text-red-500 text-red-900/50"><Trash2 size={12}/></button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* DROPPABLE AREA */}
                            <SortableContext id={rowId} items={rowModules.map(m => m.id)} strategy={rectSortingStrategy}>
                                <div 
                                    className="grid w-full transition-all"
                                    style={{
                                        gridTemplateColumns: 'repeat(1, 1fr)',
                                        gap: '8px', // Khoảng cách giữa các module
                                        gridAutoRows: `${rowHeight}px`,
                                        minHeight: rowModules.length === 0 ? '100px' : `${rowHeight}px`
                                    }}
                                >
                                    <style jsx>{`
                                        @media (min-width: 768px) { div.grid { grid-template-columns: repeat(2, 1fr) !important; } }
                                        @media (min-width: 1280px) { div.grid { grid-template-columns: repeat(4, 1fr) !important; } }
                                    `}</style>

                                    {rowModules.length === 0 && isAdmin && (
                                        <div className="col-span-full h-full flex items-center justify-center border-2 border-dashed border-[#8B5E3C]/10 text-[#5D4037] text-xs uppercase tracking-widest bg-[#0a0807]/20">
                                            Kéo thả hoặc bấm "Thêm"
                                        </div>
                                    )}

                                    {rowModules.map((mod) => (
                                        <ModuleItem 
                                            key={mod.id} id={mod.id} data={mod} isAdmin={isAdmin} 
                                            onDelete={() => onDeleteModule(mod.id)} 
                                            onEdit={(id) => onEditModule(id)} 
                                            onResizeWidth={(delta) => onResizeWidth(mod.id, delta)}
                                            onOpenDetail={onOpenDetail} onLevel2Toggle={onLevel2Toggle}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </div>
                    );
                })}

                {isAdmin && (
                    <div className="flex justify-center py-4">
                        <button onClick={handleAddRow} className="flex items-center gap-2 px-6 py-3 bg-[#1a120f] hover:text-[#C69C6D] text-[#8B5E3C] transition-all group">
                            <Plus size={18} className="group-hover:scale-110 transition-transform"/>
                            <span className="font-bold text-xs uppercase tracking-widest">Thêm Hàng Lưới Mới</span>
                        </button>
                    </div>
                )}

                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                    {activeModule ? <ModuleItem id={activeModule.id} data={activeModule} isAdmin={isAdmin} onDelete={() => {}} onEdit={() => {}} onResizeWidth={() => {}} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
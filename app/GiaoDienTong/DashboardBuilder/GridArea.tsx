'use client';
import React from 'react';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Plus, ArrowUpDown, PlusCircle, GripHorizontal } from 'lucide-react';
import { ModuleConfig } from './KieuDuLieuModule';
import ModuleItem from '../ModuleItem';

interface Props {
    modules: ModuleConfig[];
    isAdmin: boolean;
    onDragEnd: (e: DragEndEvent) => void;
    onAddToRow: (rowId: string) => void;
    onResizeRow: (rowId: string, delta: number) => void;
    onDeleteModule: (id: string) => void;
    onEditModule: (mod: ModuleConfig) => void;
    onResizeWidth: (id: string, delta: number) => void;
    onCreateNewRow: () => void;
    forceHidden?: boolean;
    // 🟢 NHẬN HÀM MỞ CHI TIẾT
    onOpenDetail?: (item: any, config: ModuleConfig) => void;
}

export default function GridArea({ 
    modules, isAdmin, onDragEnd, onAddToRow, onResizeRow, 
    onDeleteModule, onEditModule, onResizeWidth, onCreateNewRow,
    forceHidden = false, onOpenDetail
}: Props) {
    
    if (forceHidden) return null;

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

    const rows: Record<string, ModuleConfig[]> = {};
    const rowHeights: Record<string, number> = {};
    const uniqueRowIds = Array.from(new Set(modules.map(m => m.rowId || 'default')));
    
    uniqueRowIds.forEach(rid => {
        rows[rid] = modules.filter(m => (m.rowId || 'default') === rid);
        rowHeights[rid] = rows[rid][0]?.rowHeight || 250;
    });

    return (
        <div className="pt-2 px-2 md:px-4 space-y-2 pb-32">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
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
                                        <button onClick={() => onAddToRow(rowId)} className="p-1 text-blue-500 hover:text-blue-400 hover:bg-white/5 rounded transition-colors" title="Thêm vào hàng này"><Plus size={14} /></button>
                                        <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
                                        <button onClick={() => onResizeRow(rowId, -50)} className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded"><ArrowUpDown size={12} className="rotate-45"/></button>
                                        <button onClick={() => onResizeRow(rowId, 50)} className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded"><ArrowUpDown size={12}/></button>
                                    </div>
                                </div>
                            )}
                            <div className="border border-transparent hover:border-white/5 rounded-xl transition-colors">
                                <SortableContext items={rowModules.map(m => m.id)} strategy={rectSortingStrategy}>
                                    <div className="grid w-full transition-all duration-300 grid-flow-row-dense" style={{ gridTemplateColumns: `repeat(1, 1fr)`, gridAutoRows: `${h}px`, gap: '8px' } as React.CSSProperties}>
                                        <style jsx>{` @media (min-width: 768px) { div.grid { grid-template-columns: repeat(2, 1fr) !important; } } `}</style>
                                        {rowModules.map(mod => (
                                            <ModuleItem 
                                                key={mod.id} id={mod.id} data={mod} isAdmin={isAdmin} 
                                                onDelete={() => onDeleteModule(mod.id)} 
                                                onEdit={() => onEditModule(mod)} 
                                                onResizeWidth={(delta) => onResizeWidth(mod.id, delta)}
                                                // 🟢 TRUYỀN TIẾP XUỐNG DƯỚI
                                                onOpenDetail={onOpenDetail}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        </div>
                    );
                })}
            </DndContext>
        </div>
    );
}
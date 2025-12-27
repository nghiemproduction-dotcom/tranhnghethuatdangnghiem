'use client';
import React from 'react';
import { Settings2, GripHorizontal } from 'lucide-react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// SUB-COMPONENT: CARD
const KanbanCard = ({ id, data, titleKey, subCols, imageCol, onClick, canEdit, isSelected, onSelect }: any) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
        id,
        disabled: !canEdit 
    });

    const style = { 
        transform: CSS.Translate.toString(transform), 
        opacity: isDragging ? 0.5 : 1, 
        zIndex: isDragging ? 999 : 1,
        touchAction: 'none'
    };

    return (
        <div 
            ref={setNodeRef} style={style} {...listeners} {...attributes} 
            className={`
                bg-[#1a120f] p-3 rounded-lg border shadow-sm group relative touch-none select-none transition-all duration-200
                ${isSelected ? 'border-[#C69C6D] shadow-[0_0_10px_rgba(198,156,109,0.3)]' : 'border-[#8B5E3C]/30 hover:border-[#C69C6D]'}
                ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default opacity-90'}
            `}
        >
            <div className="absolute inset-0 z-10" onDoubleClick={onClick}></div>
            
            {/* 🟢 Checkbox chọn thẻ */}
            <div className="absolute top-2 left-2 z-20" onPointerDown={(e) => e.stopPropagation()}>
                 <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-600 bg-black/50 text-[#C69C6D] focus:ring-[#C69C6D] accent-[#C69C6D] cursor-pointer opacity-0 group-hover:opacity-100 data-[checked=true]:opacity-100 transition-opacity"
                    checked={isSelected}
                    data-checked={isSelected}
                    onChange={() => onSelect && onSelect(id)}
                />
            </div>

            {/* Grip Icon */}
            {canEdit && (
                <div className="absolute top-2 right-2 text-[#8B5E3C]/30 group-hover:text-[#C69C6D] opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripHorizontal size={12} />
                </div>
            )}

            <div className="flex items-start gap-3 pl-5"> {/* pl-5 để né checkbox */}
                {imageCol && data[imageCol.key] ? (
                    <img src={data[imageCol.key]} className="w-10 h-10 rounded-full object-cover bg-[#222] shrink-0 border border-[#8B5E3C]/20" alt=""/>
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a1e1b] to-black flex items-center justify-center text-xs font-bold text-[#C69C6D] shrink-0 border border-[#8B5E3C]/20">
                        {String(data[titleKey] || '?').charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex-1 min-w-0 pr-4">
                    <div className="text-sm font-bold text-[#F5E6D3] whitespace-normal break-words leading-tight line-clamp-2">
                        {String(data[titleKey] || 'Chưa đặt tên')}
                    </div>
                    {subCols?.[0] && (
                        <div className="text-[11px] text-[#A1887F] mt-1 whitespace-normal break-words leading-tight flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C]/50 inline-block"></span>
                            {String(data[subCols[0].key] || '')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// SUB-COMPONENT: COLUMN
const KanbanColumn = ({ id, title, count, children }: any) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className="min-w-[280px] w-[280px] sm:w-[320px] flex-1 bg-[#110d0c] border border-[#8B5E3C]/20 rounded-xl flex flex-col h-full max-h-full shrink-0 shadow-lg">
            <div className="p-3 border-b border-[#8B5E3C]/20 bg-[#1a120f] flex justify-between items-center rounded-t-xl sticky top-0 z-10">
                <span className="font-bold text-sm text-[#C69C6D] uppercase truncate max-w-[200px]" title={title}>{title}</span>
                <span className="bg-[#C69C6D]/10 text-[10px] font-mono px-2 py-0.5 rounded text-[#C69C6D] font-bold border border-[#C69C6D]/20">{count}</span>
            </div>
            <div className="p-2 space-y-2 flex-1 bg-[#0a0807]/50 overflow-y-auto custom-scroll">{children}</div>
        </div>
    );
};

interface Props {
    data: any[];
    kanbanGroupBy: string;
    columns: any[];
    imgCol: any;
    titleCol: any;
    onRowClick: (item: any) => void;
    sensors: any;
    onDragEnd: (e: any) => void;
    canEdit: boolean;
    // 🟢 Thêm props chọn
    selectedIds?: string[];
    onSelect?: (id: string) => void;
}

export default function KanbanView({ data, kanbanGroupBy, columns, imgCol, titleCol, onRowClick, sensors, onDragEnd, canEdit, selectedIds = [], onSelect }: Props) {
    if (!kanbanGroupBy) return (
        <div className="flex flex-col items-center justify-center h-full text-[#8B5E3C] gap-3">
            <Settings2 size={48} strokeWidth={1} />
            <span className="text-sm uppercase tracking-widest font-bold">Vui lòng chọn cột phân nhóm (Góc trên phải)</span>
        </div>
    );
    
    const groups: Record<string, any[]> = {};
    data.forEach(row => { 
        const val = String(row[kanbanGroupBy] || 'Chưa phân loại'); 
        if (!groups[val]) groups[val] = []; 
        groups[val].push(row); 
    });
    
    const sortedKeys = Object.keys(groups).sort();
    
    return (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
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
                                onClick={() => onRowClick(row)}
                                canEdit={canEdit}
                                isSelected={selectedIds.includes(row.id)}
                                onSelect={onSelect}
                            />
                        ))}
                    </KanbanColumn>
                ))}
                <div className="w-8 shrink-0"></div> 
            </div>
        </DndContext>
    );
}
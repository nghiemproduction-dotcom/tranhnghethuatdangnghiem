'use client';
import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import ModuleItem from '@/app/GiaoDienTong/ModuleItem';
import { ModuleConfig } from './KieuDuLieuModule';

interface Props {
    modules: ModuleConfig[];
    isAdmin: boolean;
    onChange: (items: ModuleConfig[]) => void;
    onEditModule: (id: string) => void;
    onDeleteModule: (id: string) => void;
    onResizeWidth: (id: string, delta: number) => void; 
    onAddModuleToRow: (rowId: string) => void;
    onOpenDetail?: (item: any, config: ModuleConfig) => void;
    // 🟢 CẬP NHẬT TYPE: Thêm tham số module vào callback này
    onLevel2Toggle?: (isOpen: boolean, module: ModuleConfig) => void;
    forceHidden?: boolean;
}

export default function GridArea({ modules, isAdmin, onChange, onEditModule, onDeleteModule, onResizeWidth, onAddModuleToRow, onOpenDetail, onLevel2Toggle, forceHidden }: Props) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = modules.findIndex((m) => m.id === active.id);
            const newIndex = modules.findIndex((m) => m.id === over.id);
            onChange(arrayMove(modules, oldIndex, newIndex));
        }
    };

    if (forceHidden) return null;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modules.map(m => m.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 pb-24">
                    {modules.map((module) => (
                        <ModuleItem 
                            key={module.id} 
                            id={module.id} 
                            data={module} 
                            isAdmin={isAdmin}
                            onEdit={onEditModule}
                            onDelete={() => onDeleteModule(module.id)}
                            onResizeWidth={(d) => onResizeWidth(module.id, d)}
                            onOpenDetail={onOpenDetail}
                            onLevel2Toggle={onLevel2Toggle}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
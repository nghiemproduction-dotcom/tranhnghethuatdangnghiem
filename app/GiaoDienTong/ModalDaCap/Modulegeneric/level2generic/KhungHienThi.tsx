import React from 'react';
import { Loader2 } from 'lucide-react';
import { CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

// Import component con
import CardView from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/level2generic/CardView';
import KanbanView from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/level2generic/KanbanView';

interface Props {
    loading: boolean;
    data: any[];
    viewMode: 'card' | 'kanban';
    columns: CotHienThi[];
    groupByCol: string;
    onRowClick: (item: any) => void;
    selectedIds: string[];
    onSelect: (id: string) => void;
    onDragEnd: (e: any) => void;
    canEdit: boolean;
}

export default function KhungHienThi({ loading, data, viewMode, columns, groupByCol, onRowClick, selectedIds, onSelect, onDragEnd, canEdit }: Props) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    
    // Xử lý cột hiển thị
    let displayColumns = columns;
    if (displayColumns.length === 0 && data.length > 0) {
        displayColumns = Object.keys(data[0])
            .filter(k => !['id', 'tao_luc', 'updated_at', 'khach_hang', 'total_khach'].includes(k))
            .map(k => ({ key: k, label: k, kieuDuLieu: 'text', hienThiList: true } as CotHienThi));
    }
    const imgCol = displayColumns.find(c => ['hinh_anh', 'avatar'].includes(c.key));
    const titleCol = displayColumns[0] || { key: 'id' };

    return (
        // 🟢 CẤU TRÚC HIỂN THỊ:
        // - bg-transparent: Trong suốt để thấy nền
        // - overflow-visible: Quan trọng! Để thanh cuộn của cha (level2generic) hoạt động
        <div className="flex-1 relative bg-transparent min-h-full">
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-[2px] rounded-xl">
                    <Loader2 className="animate-spin text-[#C69C6D]" size={30}/>
                </div>
            )}

            {data.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-[#8B5E3C] text-xs italic opacity-50">
                    <p>Chưa có dữ liệu.</p>
                </div>
            ) : (
                <>
                    {viewMode === 'card' && (
                        <CardView 
                            data={data} columns={displayColumns} imgCol={imgCol} titleCol={titleCol} 
                            canEdit={true} onRowClick={onRowClick} 
                            selectedIds={selectedIds} onSelect={onSelect} 
                        />
                    )}
                    {viewMode === 'kanban' && (
                        <KanbanView 
                            data={data} kanbanGroupBy={groupByCol} columns={displayColumns} imgCol={imgCol} titleCol={titleCol} 
                            onRowClick={onRowClick} sensors={sensors} onDragEnd={onDragEnd} canEdit={canEdit}
                            selectedIds={selectedIds} onSelect={onSelect}
                        />
                    )}
                </>
            )}
        </div>
    );
}
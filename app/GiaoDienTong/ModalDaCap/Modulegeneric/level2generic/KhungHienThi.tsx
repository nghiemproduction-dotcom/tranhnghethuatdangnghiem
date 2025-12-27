import React from 'react';
import { Loader2 } from 'lucide-react';
import { CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

// Lưu ý: Các file này nằm ngoài folder generic, import từ path cũ
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
    
    // Tìm cột ảnh và cột tiêu đề
    let displayColumns = columns;
    if (displayColumns.length === 0 && data.length > 0) {
        displayColumns = Object.keys(data[0])
            .filter(k => !['id', 'tao_luc', 'updated_at', 'khach_hang', 'total_khach'].includes(k))
            .map(k => ({ key: k, label: k, kieuDuLieu: 'text', hienThiList: true } as CotHienThi));
    }
    const imgCol = displayColumns.find(c => ['hinh_anh', 'avatar'].includes(c.key));
    const titleCol = displayColumns[0] || { key: 'id' };

    return (
        <div className="flex-1 relative overflow-hidden bg-[#0F0C0B]">
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-[2px]">
                    <Loader2 className="animate-spin text-[#C69C6D]" size={30}/>
                </div>
            )}

            {data.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-full text-[#8B5E3C] text-xs italic opacity-50">
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
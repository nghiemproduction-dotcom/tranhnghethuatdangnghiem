'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { ModuleConfig, CustomAction } from '../../KieuDuLieuModule';

import { HeaderToolbar } from './HeaderToolbar';
import { Pagination } from './Pagination';
import { TableView } from './TableView';
import { GalleryView } from './GalleryView';
import { KanbanView } from './KanbanView';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    config: ModuleConfig;
    data: any[];
    permissions: { canCreate: boolean; canEdit: boolean; canDelete: boolean };
    onSelectItem: (item: any) => void;
    onCreateNew: () => void;
    onDelete: (id: string) => void;
    onBulkDelete: (ids: string[]) => void;
    onCustomAction: (action: CustomAction, ids: string[]) => void;
}

export function DanhSachModal({ 
    isOpen, onClose, config, data, permissions, 
    onSelectItem, onCreateNew, onDelete, onBulkDelete, onCustomAction 
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [viewMode, setViewMode] = useState<'table' | 'gallery' | 'kanban'>('table');

    useEffect(() => {
        if (config.modalViewType) setViewMode(config.modalViewType);
    }, [config.modalViewType]);

    const detectedImageCol = 'hinh_anh'; 
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const processedData = useMemo(() => {
        let result = [...(data || [])];
        if (searchTerm) {
            result = result.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase())));
        }
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key]; const bVal = b[sortConfig.key];
                if (aVal === bVal) return 0;
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [data, searchTerm, sortConfig]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const displayData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const columns = config.displayColumns?.length ? config.displayColumns : (data && data.length > 0 ? Object.keys(data[0]) : []);

    const handleSort = (key: string) => { setSortConfig({ key, direction: sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' }); };
    const toggleSelectAll = () => { if (selectedItems.size === displayData.length && displayData.length > 0) setSelectedItems(new Set()); else { const newSet = new Set<string>(); displayData.forEach(item => newSet.add(item.id)); setSelectedItems(newSet); } };
    const toggleSelectItem = (id: string) => { const newSet = new Set(selectedItems); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); setSelectedItems(newSet); };

    if (!isOpen) return null;

    return (
        // 🟢 FIX RESPONSIVE: z-[100] để đè lên Header/Footer của BangChinh
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
            
            {/* 🟢 CONTAINER: Full màn hình trên Mobile (rounded-none), Có viền trên Desktop */}
            <div className="w-full h-full md:w-[98vw] md:h-[97vh] bg-[#121212] rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border-none md:border md:border-white/10" onClick={(e) => e.stopPropagation()}>
                
                <HeaderToolbar 
                    title={config.title} tableName={config.tableName} totalRecords={data.length}
                    searchTerm={searchTerm} onSearchChange={setSearchTerm}
                    selectedCount={selectedItems.size} permissions={permissions}
                    headerActions={config.customActions?.filter(a => a.location === 'list_header') || []}
                    onClose={onClose} onCreateNew={onCreateNew}
                    onBulkDelete={() => { if(confirm(`Xóa ${selectedItems.size} mục?`)) { onBulkDelete(Array.from(selectedItems)); setSelectedItems(new Set()); } }}
                    onCustomAction={(act) => { if(confirm(`Thực hiện "${act.label}"?`)) { onCustomAction(act, Array.from(selectedItems)); setSelectedItems(new Set()); } }}
                    currentViewMode={viewMode} onViewModeChange={setViewMode}
                />

                <div className="flex-1 overflow-auto custom-dark-scrollbar bg-[#0E0E0E] relative p-1 md:p-0">
                    {displayData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600"><AlertCircle size={64} className="mb-4 opacity-20"/><span className="text-lg font-light">Không tìm thấy dữ liệu.</span></div>
                    ) : (
                        <>
                            {viewMode === 'gallery' && <GalleryView data={displayData} titleCol={columns[0]} imgCol={detectedImageCol} onSelectItem={onSelectItem} />}
                            {viewMode === 'kanban' && <KanbanView data={displayData} groupBy={config.groupByColumn || 'trang_thai'} titleCol={columns[0]} onSelectItem={onSelectItem} />}
                            {viewMode === 'table' && (
                                <TableView 
                                    data={displayData} columns={columns} permissions={permissions}
                                    sortConfig={sortConfig} selectedItems={selectedItems}
                                    rowActions={config.customActions?.filter(a => a.location === 'row_action') || []}
                                    itemsPerPage={itemsPerPage} currentPage={currentPage}
                                    onSort={handleSort} onToggleSelectAll={toggleSelectAll} onToggleSelectItem={toggleSelectItem}
                                    onSelectItem={onSelectItem} onDelete={onDelete} 
                                    onCustomAction={(act, id) => onCustomAction(act, [id])}
                                />
                            )}
                        </>
                    )}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
}
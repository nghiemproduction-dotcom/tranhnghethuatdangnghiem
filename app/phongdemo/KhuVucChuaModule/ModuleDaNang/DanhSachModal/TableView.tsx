'use client';
import React from 'react';
import { CheckSquare, Square, ArrowDownAZ, ArrowUpAZ, ArrowUpDown, Zap, Trash2 } from 'lucide-react';
import { CustomAction } from '../../KieuDuLieuModule';

interface Props {
    data: any[];
    columns: string[];
    permissions: { canDelete: boolean; canEdit: boolean };
    sortConfig: { key: string, direction: 'asc' | 'desc' } | null;
    selectedItems: Set<string>;
    rowActions: CustomAction[];
    itemsPerPage: number;
    currentPage: number;
    
    onSort: (key: string) => void;
    onToggleSelectAll: () => void;
    onToggleSelectItem: (id: string) => void;
    onSelectItem: (item: any) => void;
    onDelete: (id: string) => void;
    onCustomAction: (action: CustomAction, id: string) => void;
}

export function TableView({ 
    data, columns, permissions, sortConfig, selectedItems, rowActions, itemsPerPage, currentPage,
    onSort, onToggleSelectAll, onToggleSelectItem, onSelectItem, onDelete, onCustomAction 
}: Props) {
    return (
        <table className="w-full text-left text-sm text-gray-300 border-collapse">
            <thead className="sticky top-0 bg-[#1A1A1A] text-gray-400 uppercase font-bold text-xs z-10 shadow-lg select-none">
                <tr>
                    {(permissions.canDelete || permissions.canEdit) && (
                        <th className="p-4 w-10 text-center first:rounded-tl-lg cursor-pointer hover:bg-white/5" onClick={onToggleSelectAll}>
                            {data.length > 0 && selectedItems.size === data.length ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} />}
                        </th>
                    )}
                    <th className="p-4 w-12 text-center">#</th>
                    {columns.map(col => (
                        <th key={col} className="p-4 whitespace-nowrap cursor-pointer hover:text-white hover:bg-white/5 transition-colors group" onClick={() => onSort(col)}>
                            <div className="flex items-center gap-1.5">
                                {col}
                                {sortConfig?.key === col ? (
                                    sortConfig.direction === 'asc' ? <ArrowDownAZ size={14} className="text-blue-500"/> : <ArrowUpAZ size={14} className="text-blue-500"/>
                                ) : (
                                    <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-50 transition-opacity"/>
                                )}
                            </div>
                        </th>
                    ))}
                    {(permissions.canDelete || rowActions.length > 0) && <th className="p-4 w-auto text-right last:rounded-tr-lg">Hành động</th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {data.map((row, idx) => {
                    const isSelected = selectedItems.has(row.id);
                    return (
                        <tr key={row.id} onClick={() => onSelectItem(row)} className={`cursor-pointer transition-colors group even:bg-white/[0.01] ${isSelected ? 'bg-blue-900/20 hover:bg-blue-900/30' : 'hover:bg-blue-600/10'}`}>
                            {(permissions.canDelete || permissions.canEdit) && (
                                <td className="p-4 text-center" onClick={(e) => { e.stopPropagation(); onToggleSelectItem(row.id); }}>
                                    {isSelected ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} className="text-gray-600 group-hover:text-gray-400" />}
                                </td>
                            )}
                            <td className="p-4 text-center text-gray-600 font-mono text-xs">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                            
                            {/* 🟢 CHỈ HIỆN ẢNH NẾU CỘT LÀ 'hinh_anh' */}
                            {columns.map(col => {
                                const val = row[col];
                                const isImg = col === 'hinh_anh' && typeof val === 'string' && val.length > 5;

                                return (
                                    <td key={col} className="p-4 truncate max-w-[300px] group-hover:text-white transition-colors">
                                        {isImg ? (
                                            <div className="w-10 h-10 rounded-md overflow-hidden border border-white/10 bg-white/5 relative group/img">
                                                <img src={val} alt="Img" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                                            </div>
                                        ) : (
                                            typeof val === 'object' ? 'JSON' : String(val)
                                        )}
                                    </td>
                                );
                            })}

                            {(permissions.canDelete || rowActions.length > 0) && (
                                <td className="p-4 text-right flex justify-end gap-2 items-center">
                                    {rowActions.map(act => (
                                        <button key={act.id} onClick={(e) => { e.stopPropagation(); onCustomAction(act, row.id); }} className={`p-1.5 rounded text-[10px] font-bold border flex items-center gap-1 transition-all bg-${act.color}-900/20 text-${act.color}-500 border-${act.color}-500/30 hover:bg-${act.color}-500 hover:text-white`} title={act.label}><Zap size={12}/> {act.label}</button>
                                    ))}
                                    {permissions.canDelete && (
                                        <button onClick={(e) => { e.stopPropagation(); onDelete(row.id); }} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                                    )}
                                </td>
                            )}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
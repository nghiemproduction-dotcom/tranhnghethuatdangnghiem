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
        <div className="w-full h-full overflow-auto bg-[#121212]">
            <table className="w-full text-left text-xs text-gray-400 border-collapse">
                
                {/* HEADER: Gọn gàng hơn */}
                <thead className="sticky top-0 bg-[#1E1E1E] text-gray-300 font-bold z-20 shadow-md">
                    <tr>
                        {/* Cột Checkbox Sticky */}
                        {(permissions.canDelete || permissions.canEdit) && (
                            <th className="sticky left-0 z-30 bg-[#1E1E1E] p-2 md:p-3 w-8 text-center border-r border-white/5 cursor-pointer" onClick={onToggleSelectAll}>
                                {data.length > 0 && selectedItems.size === data.length ? <CheckSquare size={14} className="text-[#0068FF]" /> : <Square size={14} />}
                            </th>
                        )}
                        <th className="p-2 md:p-3 w-10 text-center text-[10px] font-mono opacity-50">#</th>
                        
                        {columns.map(col => (
                            <th key={col} className="p-2 md:p-3 whitespace-nowrap cursor-pointer hover:text-white group" onClick={() => onSort(col)}>
                                <div className="flex items-center gap-1 uppercase text-[10px] tracking-wider">
                                    {col.replace(/_/g, ' ')}
                                    {sortConfig?.key === col ? (
                                        sortConfig.direction === 'asc' ? <ArrowDownAZ size={12} className="text-[#0068FF]"/> : <ArrowUpAZ size={12} className="text-[#0068FF]"/>
                                    ) : (
                                        <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-30 transition-opacity"/>
                                    )}
                                </div>
                            </th>
                        ))}
                        {(permissions.canDelete || rowActions.length > 0) && <th className="p-2 md:p-3 w-auto text-right sticky right-0 bg-[#1E1E1E] z-20 border-l border-white/5"></th>}
                    </tr>
                </thead>

                {/* BODY: Giảm padding để hiện nhiều dòng */}
                <tbody className="divide-y divide-white/5">
                    {data.map((row, idx) => {
                        const isSelected = selectedItems.has(row.id);
                        return (
                            <tr key={row.id} onClick={() => onSelectItem(row)} className={`cursor-pointer transition-colors group ${isSelected ? 'bg-[#0068FF]/10' : 'hover:bg-white/5'}`}>
                                
                                {/* Checkbox Sticky */}
                                {(permissions.canDelete || permissions.canEdit) && (
                                    <td className={`sticky left-0 z-10 p-2 md:p-3 text-center border-r border-white/5 ${isSelected ? 'bg-[#141d2e]' : 'bg-[#121212] group-hover:bg-[#181818]'}`} onClick={(e) => { e.stopPropagation(); onToggleSelectItem(row.id); }}>
                                        {isSelected ? <CheckSquare size={14} className="text-[#0068FF]" /> : <Square size={14} className="opacity-30 group-hover:opacity-100" />}
                                    </td>
                                )}

                                <td className="p-2 md:p-3 text-center font-mono text-[10px] opacity-40">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                
                                {columns.map(col => {
                                    const val = row[col];
                                    const isImg = col === 'hinh_anh' && typeof val === 'string';
                                    const isMoney = (col.includes('gia') || col.includes('tien') || col.includes('luong')) && typeof val === 'number';

                                    return (
                                        <td key={col} className="p-2 md:p-3 whitespace-nowrap max-w-[150px] md:max-w-[250px] truncate group-hover:text-white transition-colors border-r border-white/[0.02]">
                                            {isImg ? (
                                                <div className="w-8 h-8 rounded-md overflow-hidden border border-white/10 bg-white/5">
                                                    <img src={val} alt="Img" className="w-full h-full object-cover" />
                                                </div>
                                            ) : isMoney ? (
                                                <span className="font-mono text-green-400">{Number(val).toLocaleString()}</span>
                                            ) : (
                                                <span className="text-[13px]">{val === null ? '-' : String(val)}</span>
                                            )}
                                        </td>
                                    );
                                })}

                                {/* Actions Sticky Right */}
                                {(permissions.canDelete || rowActions.length > 0) && (
                                    <td className={`sticky right-0 z-10 p-2 text-right border-l border-white/5 ${isSelected ? 'bg-[#141d2e]' : 'bg-[#121212] group-hover:bg-[#181818]'}`}>
                                        <div className="flex justify-end gap-1">
                                            {rowActions.slice(0, 1).map(act => (
                                                <button key={act.id} onClick={(e) => { e.stopPropagation(); onCustomAction(act, row.id); }} className={`p-1.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 bg-${act.color}-900/20 text-${act.color}-500 border-${act.color}-500/30 hover:bg-${act.color}-600 hover:text-white`}>
                                                    <Zap size={10}/> {act.label}
                                                </button>
                                            ))}
                                            {permissions.canDelete && (
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(row.id); }} className="p-1.5 text-gray-600 hover:text-red-500 rounded-full hover:bg-red-500/10"><Trash2 size={14} /></button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
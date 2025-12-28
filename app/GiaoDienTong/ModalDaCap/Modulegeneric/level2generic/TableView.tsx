'use client';
import React from 'react';
import { ImageIcon, Edit } from 'lucide-react';

interface Props {
    data: any[];
    columns: any[];
    page: number;
    itemsPerPage: number;
    onRowClick: (item: any) => void;
    selectedIds?: string[];
    onSelectRow?: (id: string) => void;
    onSelectAll?: () => void;
}

export default function TableView({ data, columns, page, itemsPerPage, onRowClick, selectedIds = [], onSelectRow, onSelectAll }: Props) {
    const isAllSelected = data.length > 0 && data.every(d => selectedIds.includes(d.id));

    return (
        // 🟢 CẬP NHẬT PADDING CUỘN:
        <div className="w-full h-full overflow-auto bg-transparent custom-scroll pt-[140px] pb-[180px] px-4">
            <table className="w-full text-sm text-[#A1887F] border-collapse min-w-[1000px]">
                {/* Header dính: top-0 sẽ dính vào mép trên container (tức là sau padding-top? Không, sticky dính theo viewport). 
                   Cần chỉnh top để nó dính dưới HeaderNhung. */}
                <thead className="bg-[#1a120f]/90 backdrop-blur-sm text-xs uppercase font-bold text-[#C69C6D] sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-4 py-3 text-left border-b border-[#8B5E3C]/20 w-10">
                            <input type="checkbox" className="w-4 h-4 rounded bg-transparent text-[#C69C6D] accent-[#C69C6D] cursor-pointer" checked={isAllSelected} onChange={onSelectAll} />
                        </th>
                        <th className="px-4 py-3 text-center border-b border-[#8B5E3C]/20 w-14">STT</th>
                        {columns.map(col => (
                            <th key={col.key} className="px-4 py-3 border-b border-[#8B5E3C]/20 text-left whitespace-nowrap">
                                {col.label || col.key}
                            </th>
                        ))}
                        <th className="px-4 py-3 border-b border-[#8B5E3C]/20 text-right sticky right-0 bg-[#1a120f]/90">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#8B5E3C]/10">
                    {data.map((row, idx) => {
                        const isSelected = selectedIds.includes(row.id);
                        return (
                            <tr key={idx} onClick={() => onRowClick(row)} className={`transition-colors group cursor-pointer ${isSelected ? 'bg-[#C69C6D]/20' : 'hover:bg-[#C69C6D]/10 bg-black/20'}`}>
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                    <input type="checkbox" className="w-4 h-4 rounded bg-transparent text-[#C69C6D] accent-[#C69C6D] cursor-pointer" checked={isSelected} onChange={() => onSelectRow && onSelectRow(row.id)} />
                                </td>
                                <td className="px-4 py-3 text-center text-[#5D4037] font-mono text-xs group-hover:text-[#F5E6D3]">{(page-1)*itemsPerPage + idx + 1}</td>
                                {columns.map(col => {
                                    const val = row[col.key];
                                    const isImage = ['hinh_anh', 'avatar', 'image'].includes(col.key) || col.kieuDuLieu === 'image';
                                    if (isImage) return <td key={col.key} className="px-4 py-2">{val ? <img src={val} className="w-8 h-8 rounded-full object-cover border border-[#8B5E3C]/30"/> : <div className="w-8 h-8 rounded-full bg-[#1a120f] border border-[#8B5E3C]/20 flex items-center justify-center"><ImageIcon size={14} className="text-[#5D4037]"/></div>}</td>;
                                    return <td key={col.key} className="px-4 py-3 truncate max-w-[200px] text-[#F5E6D3] group-hover:text-white">{String(val ?? '-')}</td>;
                                })}
                                <td className="px-4 py-3 text-right sticky right-0 bg-transparent"><button className="p-1.5 rounded-full hover:bg-[#C69C6D] hover:text-[#1a120f] text-[#8B5E3C] transition-all"><Edit size={14}/></button></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
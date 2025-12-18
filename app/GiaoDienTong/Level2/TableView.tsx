'use client';
import React from 'react';
import { MoreHorizontal, ImageIcon, Edit } from 'lucide-react';

interface Props {
    data: any[];
    columns: any[];
    page: number;
    itemsPerPage: number;
    onRowClick: (item: any) => void;
}

export default function TableView({ data, columns, page, itemsPerPage, onRowClick }: Props) {
    return (
        <div className="w-full h-full overflow-auto bg-[#0a0807] custom-scroll">
            <table className="w-full text-sm text-[#A1887F] border-collapse min-w-[1000px]">
                <thead className="bg-[#1a120f] text-xs uppercase font-bold text-[#C69C6D] sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-4 py-3 text-center border-b border-[#8B5E3C]/20 w-14 bg-[#1a120f]">STT</th>
                        {columns.map(col => (
                            <th key={col.key} className="px-4 py-3 border-b border-[#8B5E3C]/20 text-left whitespace-nowrap bg-[#1a120f]">
                                {col.label || col.key}
                            </th>
                        ))}
                        <th className="px-4 py-3 border-b border-[#8B5E3C]/20 text-right bg-[#1a120f] sticky right-0">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#8B5E3C]/10">
                    {data.map((row, idx) => (
                        <tr key={idx} onClick={() => onRowClick(row)} className="hover:bg-[#C69C6D]/10 cursor-pointer transition-colors group">
                            <td className="px-4 py-3 text-center text-[#5D4037] font-mono text-xs group-hover:text-[#F5E6D3]">
                                {(page-1)*itemsPerPage + idx + 1}
                            </td>
                            {columns.map(col => {
                                const val = row[col.key];
                                if (['hinh_anh', 'avatar', 'image'].includes(col.key)) {
                                    return (
                                        <td key={col.key} className="px-4 py-2">
                                            {val ? (
                                                <img src={val} className="w-8 h-8 rounded-full border border-[#8B5E3C]/30 object-cover" alt=""/>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-[#1a120f] flex items-center justify-center border border-[#8B5E3C]/20"><ImageIcon size={14} className="text-[#5D4037]"/></div>
                                            )}
                                        </td>
                                    );
                                }
                                return (
                                    <td key={col.key} className="px-4 py-3 truncate max-w-[200px] text-[#F5E6D3] group-hover:text-white">
                                        {String(val !== null && val !== undefined ? val : '-')}
                                    </td>
                                );
                            })}
                            <td className="px-4 py-3 text-right sticky right-0 bg-[#0a0807] group-hover:bg-[#1a120f] transition-colors">
                                <button className="p-1.5 rounded-full hover:bg-[#C69C6D] hover:text-[#1a120f] text-[#8B5E3C] transition-all">
                                    <Edit size={14}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

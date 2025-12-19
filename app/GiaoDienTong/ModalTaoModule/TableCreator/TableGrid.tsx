'use client';

import React from 'react';
import { Key, Eye, Edit, Trash, Code, Trash2, ChevronDown, Check } from 'lucide-react';
import { ColumnDef } from './types';
import { SUPABASE_TYPES } from './constants';

interface TableGridProps {
    columns: ColumnDef[];
    colWidths: number[];
    onMouseDown: (idx: number, e: React.MouseEvent) => void;
    updateColumn: (idx: number, field: keyof ColumnDef, value: any) => void;
    togglePermission: (colIdx: number, type: 'permRead' | 'permEdit' | 'permDelete', role: string) => void;
    openCodeEditor: (idx: number) => void;
    removeColumn: (idx: number) => void;
    positions: string[];
}

export default function TableGrid({
    columns,
    colWidths,
    onMouseDown,
    updateColumn,
    togglePermission,
    openCodeEditor,
    removeColumn,
    positions
}: TableGridProps) {
    
    // Render Dropdown chọn kiểu dữ liệu (Nền tối)
    const renderTypeDropdown = (colIdx: number) => {
        const currentType = columns[colIdx].type;
        return (
            <div className="relative group/type h-full w-full">
                <div className="w-full h-full flex items-center px-2 text-xs text-[#F5E6D3] cursor-pointer hover:bg-[#C69C6D]/10">
                    <span className="truncate flex-1 font-mono">{currentType}</span>
                    <ChevronDown size={10} className="opacity-50 ml-1"/>
                </div>
                <div className="absolute top-[80%] left-0 w-[220px] bg-[#1a120f] border border-[#8B5E3C] rounded-lg shadow-2xl z-[110] hidden group-hover/type:block max-h-[350px] overflow-y-auto custom-scroll">
                    {SUPABASE_TYPES.map((group, gIdx) => (
                        <div key={gIdx} className="border-b border-[#8B5E3C]/20 last:border-0">
                            <div className="px-2 py-1.5 bg-[#2a1e1b] text-[9px] font-bold text-[#C69C6D] uppercase tracking-tighter">{group.group}</div>
                            {group.types.map(t => (
                                <div 
                                    key={t.value}
                                    onClick={() => updateColumn(colIdx, 'type', t.value)}
                                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-[#C69C6D] hover:text-[#1a120f] flex justify-between items-center ${currentType === t.value ? 'text-[#C69C6D] font-bold' : 'text-[#8B5E3C]'}`}
                                >
                                    <span>{t.label}</span>
                                    {currentType === t.value && <Check size={12}/>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render Dropdown phân quyền 3 lớp
    const renderPermDropdown = (colIdx: number, type: 'permRead' | 'permEdit' | 'permDelete', label: string) => {
        const selected = columns[colIdx][type];
        const isAll = selected.includes('all');
        const count = selected.length;
        
        return (
            <div className="relative group/perm h-full w-full">
                <div className={`w-full h-full flex items-center px-3 text-xs cursor-pointer hover:bg-[#C69C6D]/10 transition-colors border-l border-transparent hover:border-[#C69C6D]/30 ${count > 0 ? 'text-[#F5E6D3]' : 'text-gray-500'}`}>
                    <span className="truncate flex-1">
                        {isAll ? 'Tất cả' : (count > 0 ? `${count} vị trí` : 'Chưa set')}
                    </span>
                    <ChevronDown size={10} className="opacity-50 ml-1"/>
                </div>
                <div className="absolute top-[90%] left-0 w-[220px] bg-[#1a120f] border border-[#8B5E3C] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[100] hidden group-hover/perm:flex flex-col max-h-[300px] overflow-hidden">
                    <div className="p-2 bg-[#161210] border-b border-[#8B5E3C]/20 text-[10px] font-bold text-[#C69C6D] uppercase tracking-wider sticky top-0">{label}</div>
                    <div className="overflow-y-auto custom-scroll p-1">
                        {positions.map(role => {
                            const isChecked = selected.includes(role);
                            return (
                                <label key={role} className="flex items-center gap-3 p-2 hover:bg-[#2a1e1b] rounded cursor-pointer transition-colors select-none">
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${isChecked ? 'bg-[#C69C6D] border-[#C69C6D]' : 'border-[#8B5E3C]/50 hover:border-[#C69C6D]'}`}>
                                        {isChecked && <Check size={12} className="text-[#1a120f] stroke-[3]"/>}
                                    </div>
                                    <input type="checkbox" checked={isChecked} onChange={() => togglePermission(colIdx, type, role)} className="hidden"/>
                                    <span className={`text-xs uppercase font-medium ${isChecked ? 'text-[#F5E6D3]' : 'text-gray-500'}`}>{role}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const HEADERS = [
        { name: 'Tên Cột (DB)', icon: null },
        { name: 'Kiểu Dữ Liệu', icon: null },
        { name: 'Mặc Định', icon: null },
        { name: 'Xem', icon: <Eye size={12}/> },
        { name: 'Sửa', icon: <Edit size={12}/> },
        { name: 'Xóa', icon: <Trash size={12}/> },
        { name: 'Bắt Buộc', icon: null },
        { name: 'Logic', icon: null },
        { name: 'Xóa', icon: null },
    ];

    return (
        <div className="flex-1 overflow-auto custom-scroll bg-[#0a0807] relative">
            {/* Header Row */}
            <div className="flex sticky top-0 z-20 bg-[#1e1715] border-b border-[#8B5E3C]/30 h-10 shadow-md">
                <div className="w-10 shrink-0 border-r border-[#8B5E3C]/20 flex items-center justify-center text-[#8B5E3C] font-mono text-[10px] bg-[#2a1e1b]">#</div>
                {HEADERS.map((h, idx) => (
                    <div 
                        key={idx} 
                        className="relative flex items-center justify-center font-bold text-[#C69C6D] text-[10px] uppercase border-r border-[#8B5E3C]/20 shrink-0 group select-none hover:bg-[#2a1e1b]" 
                        style={{width: colWidths[idx]}}
                    >
                        <span className="flex items-center gap-1.5">{h.icon} {h.name}</span>
                        <div 
                            className="absolute right-0 top-0 bottom-0 w-[4px] cursor-col-resize hover:bg-[#C69C6D] z-30 opacity-0 group-hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => onMouseDown(idx, e)}
                        ></div>
                    </div>
                ))}
            </div>

            {/* Body Rows */}
            <div className="flex flex-col pb-20">
                {columns.map((col, idx) => (
                    <div key={col.id} className="flex border-b border-[#8B5E3C]/10 h-11 hover:bg-[#C69C6D]/5 transition-colors group relative">
                        <div className="w-10 shrink-0 border-r border-[#8B5E3C]/10 flex items-center justify-center text-[#5D4037] text-xs font-mono bg-[#1a120f]/50">{idx + 1}</div>
                        
                        {/* 0. Name */}
                        <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[0]}}>
                            <input type="text" value={col.name} onChange={(e) => updateColumn(idx, 'name', e.target.value)} className="w-full h-full bg-transparent px-3 text-sm text-[#F5E6D3] font-mono outline-none placeholder-[#5D4037]" placeholder="col_name"/>
                        </div>

                        {/* 1. Type */}
                        <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[1]}}>
                            {renderTypeDropdown(idx)}
                        </div>

                        {/* 2. Default */}
                        <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[2]}}>
                            <input type="text" value={col.defaultValue} onChange={(e) => updateColumn(idx, 'defaultValue', e.target.value)} className="w-full h-full bg-transparent px-3 text-xs text-gray-400 font-mono outline-none placeholder-gray-700" placeholder="NULL"/>
                        </div>

                        {/* 3, 4, 5. Permissions */}
                        <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[3]}}>{renderPermDropdown(idx, 'permRead', 'Quyền Xem')}</div>
                        <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[4]}}>{renderPermDropdown(idx, 'permEdit', 'Quyền Sửa')}</div>
                        <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[5]}}>{renderPermDropdown(idx, 'permDelete', 'Quyền Xóa')}</div>

                        {/* 6. PK/Required */}
                        <div className="border-r border-[#8B5E3C]/10 shrink-0 flex items-center justify-center gap-2" style={{width: colWidths[6]}}>
                            <div title="PK" className={`w-5 h-5 flex items-center justify-center rounded cursor-pointer transition-all ${col.isPk ? 'bg-[#C69C6D] text-[#1a120f]' : 'bg-[#2a1e1b] text-[#5D4037]'}`} onClick={() => updateColumn(idx, 'isPk', !col.isPk)}><Key size={10}/></div>
                            <div title="Bắt buộc" className={`w-5 h-5 flex items-center justify-center rounded cursor-pointer border transition-all ${col.isRequired ? 'bg-red-900/30 border-red-500 text-red-400' : 'border-[#8B5E3C]/20 text-[#5D4037]'}`} onClick={() => !col.isPk && updateColumn(idx, 'isRequired', !col.isRequired)}><span className="text-[9px] font-bold">*</span></div>
                        </div>

                        {/* 7. Logic */}
                        <div className="border-r border-[#8B5E3C]/10 shrink-0 p-1.5" style={{width: colWidths[7]}}>
                            <div onClick={() => openCodeEditor(idx)} className={`w-full h-full flex items-center px-2 cursor-pointer rounded border border-transparent hover:border-[#C69C6D]/30 transition-all ${col.logicCode ? 'bg-green-900/20 text-green-400' : 'text-[#5D4037] hover:bg-[#2a1e1b]'}`}>
                                <Code size={12} className="mr-1.5"/><span className="truncate text-[10px] font-mono">{col.logicCode ? '{ JS }' : 'Trống'}</span>
                            </div>
                        </div>

                        {/* 8. Delete */}
                        <div className="shrink-0 flex items-center justify-center" style={{width: colWidths[8]}}>
                            <button onClick={() => removeColumn(idx)} className="p-1.5 text-[#5D4037] hover:text-red-500 hover:bg-red-900/10 rounded transition-all"><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
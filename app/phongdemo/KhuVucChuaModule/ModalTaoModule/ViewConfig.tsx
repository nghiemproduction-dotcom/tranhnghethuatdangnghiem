'use client';
import React from 'react';
import { Table as TableIcon, Image as ImageIcon, Layout } from 'lucide-react';
import { ModuleConfig } from '../KieuDuLieuModule';

interface Props {
    config: Partial<ModuleConfig>;
    setConfig: (val: any) => void;
    columns: string[];
}

export function ViewConfig({ config, setConfig, columns }: Props) {
    return (
        <div className="p-6 space-y-6 bg-[#0E0E0E] overflow-y-auto   h-full border-l border-r border-white/5">
            <h4 className="text-[10px] text-purple-500 font-bold uppercase mb-4">4. Cấu hình Modal Mở Rộng (Khi Click)</h4>
            
            <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-2 font-bold">Giao diện chi tiết</label>
                <div className="grid grid-cols-3 gap-3">
                    {[{ id: 'table', name: 'Bảng Dữ Liệu', icon: TableIcon }, { id: 'gallery', name: 'Thư Viện Ảnh', icon: ImageIcon }, { id: 'kanban', name: 'Kanban Board', icon: Layout }].map((type) => (
                        <button key={type.id} onClick={() => setConfig({...config, modalViewType: type.id as any})} className={`p-4 border rounded-sm flex flex-col items-center gap-2 transition-all ${config.modalViewType === type.id ? 'bg-purple-900/20 border-purple-500 text-white' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>
                            <type.icon size={20}/> <span className="text-[10px] font-bold uppercase">{type.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {config.modalViewType === 'gallery' && (
                <div className="animate-in fade-in">
                    <label className="block text-[9px] uppercase text-gray-400 mb-1 font-bold">Chọn cột chứa Link Ảnh</label>
                    <select className="w-full bg-[#1A1A1A] border border-white/10 p-2 text-xs text-white rounded-sm outline-none" value={config.imageColumn || ''} onChange={e => setConfig({...config, imageColumn: e.target.value})}>
                        <option value="">-- Chọn cột ảnh --</option>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
}
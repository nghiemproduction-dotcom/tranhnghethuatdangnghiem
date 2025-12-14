'use client';
import React from 'react';
import { Loader2, List, Layout, BarChart3, Hash, PieChart, CheckSquare, Square, Database, AlertCircle } from 'lucide-react';
import { ModuleConfig } from '../KieuDuLieuModule';

interface Props {
    config: Partial<ModuleConfig>;
    setConfig: (val: any) => void;
    tables: string[];
    columns: string[];
    loadingTables: boolean;
    initialData?: ModuleConfig;
    toggleColumn: (col: string) => void;
    handleSelectAllCols: () => void;
}

export function BasicConfig({ config, setConfig, tables, columns, loadingTables, initialData, toggleColumn, handleSelectAllCols }: Props) {
    
    // Logic hiển thị cấu hình chi tiết
    const showGroupBy = config.viewType === 'chart' || config.viewType === 'bar' || config.viewType === 'kanban';

    return (
        <div className="p-6 space-y-8 overflow-y-auto   h-full bg-[#0E0E0E]">
            
            {/* 1. NGUỒN DỮ LIỆU */}
            <section className="space-y-4 border-b border-white/5 pb-6">
                <h4 className="text-[11px] text-blue-500 font-bold uppercase tracking-wider mb-2">1. Định Danh & Nguồn Dữ Liệu</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="block text-[10px] text-gray-500 mb-1 font-bold">Tên Module</label>
                        <input type="text" className="w-full bg-[#1A1A1A] border border-white/10 p-2.5 text-white text-sm rounded focus:border-blue-500 outline-none" placeholder="Vd: Doanh Số" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} />
                    </div>
                    <div className="group">
                        <label className="block text-[10px] text-gray-500 mb-1 font-bold flex justify-between"><span>Bảng Dữ Liệu</span>{loadingTables && <Loader2 size={12} className="animate-spin"/>}</label>
                        <select className="w-full bg-[#1A1A1A] border border-white/10 p-2.5 text-yellow-500 font-mono text-sm rounded focus:border-blue-500 outline-none" value={config.tableName} disabled={!!initialData} onChange={e => setConfig({...config, tableName: e.target.value, displayColumns: []})}>
                            <option value="">-- Chọn bảng --</option>
                            {tables.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </section>

            {/* 🟢 2. CHỌN CỘT HIỂN THỊ (Đã dời lên đây) */}
            <section className="space-y-4 border-b border-white/5 pb-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[11px] text-green-500 font-bold uppercase tracking-wider">2. Cột Hiển Thị</h4>
                    <button onClick={handleSelectAllCols} disabled={!config.tableName} className="text-[10px] text-blue-500 hover:underline disabled:opacity-50 font-bold">{config.displayColumns?.length === columns.length && columns.length > 0 ? 'Bỏ chọn' : 'Chọn tất cả'}</button>
                </div>
                <div className="max-h-[150px] overflow-y-auto   border border-white/10 rounded-sm bg-[#151515] p-1">
                    {!config.tableName ? <div className="flex items-center justify-center p-4 text-gray-600 gap-2"><Database size={16} className="opacity-50"/><span className="text-xs italic">Chưa chọn bảng</span></div> : 
                     columns.length === 0 ? <div className="flex items-center justify-center p-4 text-red-500/50 gap-2"><AlertCircle size={16}/><span className="text-xs">Không có cột</span></div> :
                     (<div className="grid grid-cols-2 gap-1">{columns.map(col => (<div key={col} onClick={() => toggleColumn(col)} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer select-none transition-colors ${config.displayColumns?.includes(col) ? 'bg-blue-900/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}>{config.displayColumns?.includes(col) ? <CheckSquare size={14} className="text-blue-500 shrink-0"/> : <Square size={14} className="text-gray-600 shrink-0"/>}<span className={`text-xs font-mono truncate ${config.displayColumns?.includes(col) ? 'text-white' : 'text-gray-400'}`}>{col}</span></div>))}</div>)}
                </div>
                <p className="text-[9px] text-gray-600 italic">* Cột đầu tiên được chọn sẽ là Tiêu đề chính.</p>
            </section>

            {/* 3. KIỂU WIDGET (Đã bỏ 3 nút bấm) */}
            <section className="space-y-4">
                <h4 className="text-[11px] text-orange-500 font-bold uppercase tracking-wider mb-2">3. Kiểu Hiển Thị Dashboard</h4>
                
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'metric', name: 'Thẻ Số', icon: Hash },
                        { id: 'list', name: 'Danh Sách', icon: List },
                        { id: 'chart', name: 'Tròn', icon: PieChart },
                        { id: 'bar', name: 'Cột', icon: BarChart3 },
                        { id: 'kanban', name: 'Kanban', icon: Layout },
                    ].map((type) => (
                        <button key={type.id} onClick={() => setConfig({...config, viewType: type.id as any})} className={`p-3 border rounded flex flex-col items-center gap-2 transition-all ${config.viewType === type.id ? 'bg-orange-900/30 border-orange-500 text-white' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>
                            <type.icon size={20}/> <span className="text-[10px] font-bold uppercase">{type.name}</span>
                        </button>
                    ))}
                </div>

                {/* Cấu hình chi tiết (Hiện khi cần) */}
                {showGroupBy && (
                    <div className="mt-4 p-4 bg-[#151515] border border-white/10 rounded-lg animate-in slide-in-from-top-2">
                        <h5 className="text-[10px] text-white font-bold uppercase border-b border-white/5 pb-1 mb-3">Cấu hình Biểu đồ / Kanban</h5>
                        <div>
                            <label className="block text-[9px] text-gray-500 mb-1">Cột để Nhóm/Phân loại (Trục X)</label>
                            <select className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded outline-none" value={config.groupByColumn || ''} onChange={e => setConfig({...config, groupByColumn: e.target.value})}>
                                <option value="">-- Chọn cột (Vd: trang_thai) --</option>
                                {columns.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
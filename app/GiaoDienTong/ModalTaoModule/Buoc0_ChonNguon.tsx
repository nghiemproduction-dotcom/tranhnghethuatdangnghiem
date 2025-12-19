'use client';

import React, { useState, useEffect } from 'react';
import { Database, Search, Loader2, Plus, Lock, Unlock, RefreshCw, ArrowRight } from 'lucide-react';
import { getTablesWithRLSAction, toggleRLSAction } from '@/app/actions/admindb';
import { ModuleConfig } from '../KieuDuLieuModule';

interface Props {
    config: ModuleConfig;
    setConfig: (val: any) => void;
    onNext: () => void;
}

export default function Buoc0_ChonNguon({ config, setConfig, onNext }: Props) {
    const [tables, setTables] = useState<{table_name: string, rls_enabled: boolean}[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<string | null>(config.bangDuLieu || null);
    const [processingRLS, setProcessingRLS] = useState<string | null>(null);

    const fetchTables = async () => {
        setLoading(true);
        const res = await getTablesWithRLSAction();
        if (res.success && res.data) {
            // 🔴 FIX LỖI: Ép kiểu 'as any' để TypeScript không bắt bẻ RowList vs Array
            setTables(res.data as any);
        } else {
            console.error("Lỗi tải bảng:", res.error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchTables(); }, []);

    const handleSelect = (tableName: string) => {
        setSelected(tableName);
        const autoName = config.tenModule || (tableName.charAt(0).toUpperCase() + tableName.slice(1).replace(/_/g, ' '));
        setConfig({ ...config, bangDuLieu: tableName, tenModule: autoName });
    };

    const handleToggleRLS = async (tableName: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(currentStatus ? `MỞ KHÓA (Unrestricted) cho bảng '${tableName}'?` : `KHÓA BẢNG (Enable RLS) cho bảng '${tableName}'?`)) return;
        
        setProcessingRLS(tableName);
        const res = await toggleRLSAction(tableName, !currentStatus);
        if (res.success) await fetchTables(); else alert("Lỗi: " + res.error);
        setProcessingRLS(null);
    };

    const handleCreateNew = () => {
        setSelected(null);
        setConfig({ ...config, bangDuLieu: '' });
        onNext();
    };

    const filtered = tables.filter(t => t.table_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between gap-4 shrink-0 bg-[#161210] p-4 rounded-xl border border-[#8B5E3C]/20">
                <h3 className="text-sm font-bold text-[#F5E6D3] uppercase flex items-center gap-2"><Database size={16} className="text-[#C69C6D]"/> Nguồn Dữ Liệu</h3>
                <div className="flex gap-2">
                    <div className="relative w-[250px]">
                        <Search size={14} className="absolute left-3 top-2.5 text-[#8B5E3C]"/>
                        <input type="text" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Tìm bảng..." className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5E6D3] outline-none"/>
                    </div>
                    <button onClick={fetchTables} className="p-2 bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg text-[#8B5E3C] hover:text-[#C69C6D]"><RefreshCw size={14}/></button>
                </div>
            </div>

            <div className="flex-1 bg-[#1a120f] border border-[#8B5E3C]/20 rounded-2xl overflow-hidden flex flex-col relative">
                {loading ? <div className="absolute inset-0 flex items-center justify-center text-[#C69C6D]"><Loader2 className="animate-spin" size={32}/></div> : (
                    <div className="flex-1 overflow-y-auto custom-scroll">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#2a1e1b] text-[#8B5E3C] uppercase sticky top-0 z-10">
                                <tr><th className="p-4 w-[50%]">Tên Bảng</th><th className="p-4 w-[30%]">Bảo Mật</th><th className="p-4 w-[20%] text-right">Thao Tác</th></tr>
                            </thead>
                            <tbody className="divide-y divide-[#8B5E3C]/10">
                                <tr onClick={handleCreateNew} className="hover:bg-[#C69C6D]/10 cursor-pointer group">
                                    <td className="p-4 flex items-center gap-3 text-[#C69C6D] font-bold"><div className="p-1.5 bg-[#C69C6D]/20 rounded"><Plus size={14}/></div> Tạo Bảng Mới</td>
                                    <td className="p-4 text-[#8B5E3C]">-</td>
                                    <td className="p-4 text-right"><ArrowRight size={16} className="ml-auto text-[#8B5E3C] group-hover:text-[#C69C6D]"/></td>
                                </tr>
                                {filtered.map(t => (
                                    <tr key={t.table_name} onClick={()=>handleSelect(t.table_name)} className={`cursor-pointer transition-colors ${selected===t.table_name ? 'bg-[#C69C6D]/20' : 'hover:bg-[#1f1a18]'}`}>
                                        <td className="p-4 font-mono text-[#F5E6D3]">{t.table_name}</td>
                                        <td className="p-4">
                                            {t.rls_enabled ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-900/30 text-red-400 border border-red-500/30 font-bold uppercase"><Lock size={10}/> Đang Khóa</span>
                                            : <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-500/30 font-bold uppercase"><Unlock size={10}/> Đã Mở</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={(e)=>handleToggleRLS(t.table_name, t.rls_enabled, e)} disabled={processingRLS===t.table_name} className={`px-3 py-1.5 rounded border font-bold uppercase transition-all ${t.rls_enabled ? 'border-green-500/50 text-green-400 hover:bg-green-900/20' : 'border-[#8B5E3C]/30 text-[#8B5E3C] hover:text-[#F5E6D3] hover:bg-[#2a1e1b]'}`}>
                                                {processingRLS===t.table_name ? <Loader2 size={12} className="animate-spin"/> : (t.rls_enabled ? 'Mở Khóa' : 'Khóa Lại')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="flex-1 flex justify-end shrink-0 h-10 items-end">
                <button onClick={onNext} disabled={!selected} className="px-8 py-3 bg-[#C69C6D] text-[#1a120f] font-bold text-xs uppercase rounded-lg hover:bg-[#b08b5e] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                    {selected ? `Tiếp Tục Với: ${selected}` : 'Vui Lòng Chọn Bảng'}
                </button>
            </div>
        </div>
    );
}
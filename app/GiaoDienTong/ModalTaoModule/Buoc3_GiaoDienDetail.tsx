'use client';

import React, { useState, useEffect } from 'react';
import { Link2, Loader2, Plus, Trash2, ArrowRight } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { createForeignKeyAction } from '@/app/actions/admindb';
import { ModuleConfig } from '../KieuDuLieuModule';

interface Props {
    config: ModuleConfig;
    setConfig: (val: any) => void;
}

export default function Buoc3_GiaoDienDetail({ config, setConfig }: Props) {
    const [targetTables, setTargetTables] = useState<string[]>([]);
    const [loadingTables, setLoadingTables] = useState(false);
    
    // Form State
    const [sourceCol, setSourceCol] = useState('');
    const [targetTable, setTargetTable] = useState('');
    const [targetCol, setTargetCol] = useState('id'); // Mặc định ID
    const [creating, setCreating] = useState(false);

    // Load danh sách bảng để liên kết
    useEffect(() => {
        const load = async () => {
            setLoadingTables(true);
            const { data } = await supabase.rpc('get_tables');
            if (data) setTargetTables(data.map((t: any) => t.table_name).filter((t: string) => t !== config.bangDuLieu));
            setLoadingTables(false);
        };
        load();
    }, [config.bangDuLieu]);

    const handleCreateRelation = async () => {
        if (!sourceCol || !targetTable) return alert("Vui lòng chọn đủ thông tin!");
        setCreating(true);
        
        // Gọi Server Action tạo FK
        const res = await createForeignKeyAction(config.bangDuLieu, sourceCol, targetTable, targetCol);
        
        if (res.success) {
            alert("Đã tạo liên kết thành công!");
            // Lưu metadata vào config để App biết
            const newRelation = { 
                sourceCol, 
                targetTable, 
                targetCol, 
                type: 'Many-to-One' 
            };
            const currentRelations = config.widgetData?.relations || [];
            setConfig({
                ...config,
                widgetData: { ...config.widgetData, relations: [...currentRelations, newRelation] }
            });
            setSourceCol(''); setTargetTable('');
        } else {
            alert("Lỗi tạo liên kết: " + res.error);
        }
        setCreating(false);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="shrink-0 flex items-center gap-2 text-[#F5E6D3]">
                <Link2 size={18} className="text-[#C69C6D]"/>
                <h3 className="text-sm font-bold uppercase tracking-widest">3. Thiết Lập Quan Hệ (Relationships)</h3>
            </div>

            {/* Form Tạo Liên Kết */}
            <div className="bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl p-5 shadow-lg">
                <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-[#8B5E3C] uppercase">Cột Bảng Hiện Tại ({config.bangDuLieu})</label>
                        <select 
                            value={sourceCol} onChange={(e) => setSourceCol(e.target.value)}
                            className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded px-3 py-2 text-sm text-[#F5E6D3] outline-none"
                        >
                            <option value="">-- Chọn cột --</option>
                            {config.danhSachCot?.map(c => <option key={c.key} value={c.key}>{c.key} ({c.kieuDuLieu})</option>)}
                        </select>
                    </div>

                    <div className="pb-3 text-[#8B5E3C]"><ArrowRight size={16}/></div>

                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-[#8B5E3C] uppercase">Bảng Đích (Target Table)</label>
                        <select 
                            value={targetTable} onChange={(e) => setTargetTable(e.target.value)}
                            className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded px-3 py-2 text-sm text-[#F5E6D3] outline-none"
                        >
                            <option value="">-- Chọn bảng --</option>
                            {targetTables.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-[#8B5E3C] uppercase">Cột Đích (Target ID)</label>
                        <input type="text" value={targetCol} disabled className="w-full bg-[#161210] border border-[#8B5E3C]/10 rounded px-3 py-2 text-sm text-gray-500 cursor-not-allowed"/>
                    </div>

                    <button 
                        onClick={handleCreateRelation} 
                        disabled={creating}
                        className="bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold h-[38px] px-4 rounded flex items-center gap-2 text-xs uppercase"
                    >
                        {creating ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>} Liên Kết
                    </button>
                </div>
                <p className="text-[10px] text-[#8B5E3C] mt-3 italic">* Ví dụ: Cột <b>user_id</b> trong bảng hiện tại liên kết tới bảng <b>nhan_su</b> cột <b>id</b>.</p>
            </div>

            {/* Danh Sách Liên Kết Đã Tạo */}
            <div className="flex-1 bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl overflow-hidden flex flex-col">
                <div className="p-3 bg-[#161210] border-b border-[#8B5E3C]/20 text-xs font-bold text-[#F5E6D3] uppercase">Danh Sách Quan Hệ</div>
                <div className="flex-1 p-4 overflow-y-auto custom-scroll">
                    {config.widgetData?.relations?.length > 0 ? (
                        <div className="space-y-2">
                            {config.widgetData.relations.map((rel: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0a0807] border border-[#8B5E3C]/10 rounded hover:border-[#C69C6D]/30 transition-all">
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="text-[#C69C6D] font-bold font-mono">{config.bangDuLieu}.{rel.sourceCol}</span>
                                        <ArrowRight size={12} className="text-[#8B5E3C]"/>
                                        <span className="text-[#F5E6D3] font-bold font-mono">{rel.targetTable}.{rel.targetCol}</span>
                                    </div>
                                    <button className="text-[#5D4037] hover:text-red-500"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-[#5D4037] text-xs mt-10">Chưa có liên kết nào.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
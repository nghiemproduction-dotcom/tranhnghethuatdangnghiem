'use client';

import React from 'react';
import { Save, Loader2, Unlock } from 'lucide-react';

interface ToolbarProps {
    tableName: string;
    setTableName: (name: string) => void;
    initialTable?: string;
    onUnlock: () => void;
    onSave: () => void;
    loading: boolean;
}

export default function Toolbar({ tableName, setTableName, initialTable, onUnlock, onSave, loading }: ToolbarProps) {
    return (
        <div className="h-14 flex items-center justify-between px-4 bg-[#161210] border-b border-[#8B5E3C]/20 shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 bg-[#0a0807] px-3 py-1.5 rounded border border-[#8B5E3C]/20">
                    <span className="text-[10px] font-bold text-[#8B5E3C] uppercase">Tên Bảng (DB):</span>
                    <input 
                        type="text" 
                        value={tableName} 
                        onChange={(e) => setTableName(e.target.value)} 
                        disabled={!!initialTable}
                        className="bg-transparent text-[#F5E6D3] font-bold text-sm w-[200px] outline-none placeholder-[#5D4037]"
                        placeholder="nhap_ten_bang_khong_dau"
                    />
                </div>
                
                <button 
                    onClick={onUnlock} 
                    className="flex items-center gap-2 px-3 py-1.5 text-[#8B5E3C] hover:text-[#C69C6D] border border-[#8B5E3C]/20 hover:border-[#C69C6D] rounded bg-[#0a0807] transition-all text-xs font-bold uppercase"
                    title="Mở khóa quyền truy cập (Disable RLS)"
                >
                    <Unlock size={14}/> Mở Khóa
                </button>
            </div>

            <button 
                onClick={onSave} 
                disabled={loading} 
                className="flex items-center gap-2 px-6 py-2 bg-[#C69C6D] text-[#1a120f] font-bold text-xs uppercase rounded hover:bg-[#b08b5e] shadow-lg disabled:opacity-50 transition-all active:scale-95"
            >
                {loading ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                <span>{initialTable ? 'Lưu Cấu Trúc' : 'Khởi Tạo Bảng'}</span>
            </button>
        </div>
    );
}
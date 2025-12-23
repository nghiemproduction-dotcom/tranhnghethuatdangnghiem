'use client';
import React, { useState } from 'react';
import { Database, ExternalLink } from 'lucide-react';
import { ModuleConfig } from '../../../../../DashboardBuilder/KieuDuLieuModule';

export default function AutoFixSQL({ config }: { config: ModuleConfig }) {
    const generateSQL = () => {
        let sql = `-- SQL FIX CHO BẢNG: ${config.bangDuLieu}\n`;
        sql += `CREATE TABLE IF NOT EXISTS ${config.bangDuLieu} (\n  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,\n  created_at timestamptz DEFAULT now()\n);\n\n`;
        config.danhSachCot.forEach(col => {
            if (['id', 'created_at'].includes(col.key)) return;
            let type = 'text';
            if (['number', 'int4'].includes(col.kieuDuLieu)) type = 'integer';
            if (['int8'].includes(col.kieuDuLieu)) type = 'bigint';
            if (['numeric', 'currency', 'percent'].includes(col.kieuDuLieu)) type = 'numeric';
            if (col.kieuDuLieu === 'boolean') type = 'boolean';
            if (col.kieuDuLieu === 'date') type = 'date';
            if (col.kieuDuLieu === 'timestamptz' || col.kieuDuLieu === 'datetime') type = 'timestamptz';
            if (['link_array', 'text[]'].includes(col.kieuDuLieu)) type = 'text[]';
            sql += `ALTER TABLE ${config.bangDuLieu} ADD COLUMN IF NOT EXISTS ${col.key} ${type};\n`;
        });
        sql += `\nNOTIFY pgrst, 'reload schema';`;
        return sql;
    };

    const handleAction = () => {
        const sql = generateSQL();
        navigator.clipboard.writeText(sql);
        
        // Lấy Project Ref từ URL Supabase trong env
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || '_';
        
        // Link trực tiếp đến SQL Editor
        const url = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
        
        if(confirm("Hệ thống sẽ copy lệnh SQL và mở trang Supabase SQL Editor. Bạn hãy Paste (Ctrl+V) và chạy lệnh (Run) ở đó nhé!")) {
            window.open(url, '_blank');
        }
    };

    return (
        <button 
            onClick={handleAction}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-500/50 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all animate-pulse"
            title="Phát hiện lỗi cấu trúc Database. Bấm để sửa ngay!"
        >
            <Database size={16}/>
            <span className="uppercase">Sửa Lỗi Database (Auto Fix)</span>
            <ExternalLink size={12}/>
        </button>
    );
}
'use client';

import React, { useState, useEffect } from 'react';
import { LayoutGrid, Table, Kanban, Loader2, ChevronLeft, ChevronRight, Columns, RefreshCw } from 'lucide-react';
import { getTableDataPaginatedAction } from '@/app/actions/admindb';
import { ModuleConfig } from '../KieuDuLieuModule';

interface Props {
    config: ModuleConfig;
    setConfig: (val: any) => void;
}

export default function Buoc2_GiaoDienList({ config, setConfig }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10; 

    // 🔴 FIX LỖI Ở ĐÂY: Ép kiểu 'as any' để truy cập thuộc tính gridCols chưa có trong interface gốc
    const gridCols = (config.listConfig as any)?.gridCols || 1;

    const fetchData = async (p: number) => {
        if (!config.bangDuLieu) return;
        setLoading(true);
        const res = await getTableDataPaginatedAction(config.bangDuLieu, p, pageSize);
        if (res.success && res.data) {
            setData(res.data);
            setTotal(res.total || 0);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(page); }, [page, config.bangDuLieu]);

    return (
        <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
            {/* Toolbar */}
            <div className="shrink-0 bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#F5E6D3] font-bold text-xs uppercase">
                    <LayoutGrid size={18} className="text-[#C69C6D]"/> 2. Giao Diện Danh Sách
                </div>
                <div className="flex items-center gap-4">
                    {/* Chọn Kiểu hiển thị */}
                    <div className="flex bg-[#0a0807] rounded p-1 border border-[#8B5E3C]/30">
                        {[{id:'table',i:<Table size={14}/>},{id:'card',i:<LayoutGrid size={14}/>},{id:'kanban',i:<Kanban size={14}/>}].map(m=>(
                            <button key={m.id} onClick={()=>setConfig({...config, kieuHienThiList: m.id})} className={`p-1.5 rounded transition-all ${config.kieuHienThiList===m.id?'bg-[#C69C6D] text-[#1a120f]':'text-[#8B5E3C] hover:text-[#F5E6D3]'}`}>{m.i}</button>
                        ))}
                    </div>
                    {/* Chọn Số cột */}
                    {config.kieuHienThiList!=='table' && (
                        <div className="flex items-center gap-2 border-l border-[#8B5E3C]/20 pl-4">
                            <span className="text-[9px] text-[#8B5E3C] uppercase font-bold"><Columns size={12}/> Cột:</span>
                            {[1,2,3].map(c=>(
                                <button key={c} onClick={()=>setConfig({...config, listConfig:{...config.listConfig, gridCols:c}})} className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold border transition-all ${gridCols===c?'bg-[#C69C6D] text-[#1a120f] border-[#C69C6D]':'bg-[#0a0807] text-[#8B5E3C] border-[#8B5E3C]/30'}`}>{c}</button>
                            ))}
                        </div>
                    )}
                    <button onClick={()=>fetchData(page)} className="p-1.5 text-[#8B5E3C] hover:text-[#F5E6D3]"><RefreshCw size={14}/></button>
                </div>
            </div>

            {/* Preview Grid */}
            <div className="flex-1 bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl overflow-hidden flex flex-col relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[#C69C6D] gap-2 bg-[#1a120f]/80 z-10"><Loader2 className="animate-spin" size={24}/><span className="text-xs">Đang tải...</span></div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scroll p-4">
                        {(!config.kieuHienThiList || config.kieuHienThiList === 'table') ? (
                            <table className="w-full text-left text-[10px]">
                                <thead className="bg-[#2a1e1b] text-[#8B5E3C] uppercase sticky top-0"><tr>{config.danhSachCot?.slice(0,6).map((c,i)=><th key={i} className="px-3 py-2 whitespace-nowrap">{c.label}</th>)}</tr></thead>
                                <tbody className="divide-y divide-[#8B5E3C]/10">{data.map((r,i)=><tr key={i} className="hover:bg-[#C69C6D]/5">{config.danhSachCot?.slice(0,6).map((c,j)=><td key={j} className="px-3 py-2 text-[#F5E6D3] truncate max-w-[150px]">{String(r[c.key]||'-')}</td>)}</tr>)}</tbody>
                            </table>
                        ) : (
                            <div className="grid gap-4" style={{gridTemplateColumns:`repeat(${gridCols}, minmax(0, 1fr))`}}>
                                {data.map((row,i)=>{
                                    const imgKey = config.danhSachCot?.find(c=>c.key==='hinh_anh')?.key || config.danhSachCot?.find(c=>c.kieuDuLieu==='text' && c.key.includes('img'))?.key;
                                    const titleKey = config.danhSachCot?.find(c=>c.key==='ten_hien_thi')?.key || 'id';
                                    return (
                                        <div key={i} className="bg-[#0a0807] border border-[#8B5E3C]/20 rounded-lg overflow-hidden flex flex-col hover:border-[#C69C6D]/50 transition-all">
                                            {imgKey && <div className="aspect-video bg-[#161210] flex items-center justify-center overflow-hidden">{row[imgKey]?<img src={row[imgKey]} className="w-full h-full object-cover"/>:<span className="text-[#5D4037] text-[10px]">No Image</span>}</div>}
                                            <div className="p-3">
                                                <h4 className="text-xs font-bold text-[#F5E6D3] truncate mb-1">{row[titleKey]||'No Title'}</h4>
                                                <div className="space-y-1">{config.danhSachCot?.slice(0,3).filter(c=>c.key!==imgKey&&c.key!==titleKey).map(c=><div key={c.key} className="flex justify-between text-[9px]"><span className="text-[#8B5E3C]">{c.label}:</span><span className="text-[#F5E6D3] truncate max-w-[60%]">{String(row[c.key]||'-')}</span></div>)}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {!data.length && !loading && <div className="text-center text-[#5D4037] text-xs mt-10">Chưa có dữ liệu nào.</div>}
                    </div>
                )}
                {/* Pagination */}
                <div className="flex items-center justify-between p-3 border-t border-[#8B5E3C]/20 bg-[#161210]">
                    <span className="text-[10px] text-[#8B5E3C]">Tổng: {total} dòng</span>
                    <div className="flex items-center gap-2">
                        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1 rounded hover:bg-[#2a1e1b] disabled:opacity-30 text-[#8B5E3C]"><ChevronLeft size={14}/></button>
                        <span className="text-[10px] text-[#F5E6D3]">{page} / {Math.ceil(total/pageSize)||1}</span>
                        <button onClick={()=>setPage(p=>Math.min(Math.ceil(total/pageSize),p+1))} disabled={page>=Math.ceil(total/pageSize)} className="p-1 rounded hover:bg-[#2a1e1b] disabled:opacity-30 text-[#8B5E3C]"><ChevronRight size={14}/></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
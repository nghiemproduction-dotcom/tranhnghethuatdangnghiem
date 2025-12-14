'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 
import { Loader2, Eye, Layout, GripVertical } from 'lucide-react';
import { ModuleConfig } from '../KieuDuLieuModule';
// 🟢 CHỈ IMPORT NHỮNG CÁI ĐANG CÓ (Đã bỏ ButtonView)
import { ChartView, BarView, KanbanWidget, MetricView, ListView } from '../ModuleDaNang/WidgetHienThi';

interface Props {
    config: Partial<ModuleConfig>;
}

// 🟢 HÀM COMPONENT PHẢI CÓ 'return' JSX
export function PreviewSection({ config }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!config.tableName) return;
        const fetchSample = async () => {
            setLoading(true);
            const { data: res, error: err } = await supabase.from(config.tableName!).select('*').limit(20);
            if (err) setError(err.message);
            else setData(res || []);
            setLoading(false);
        };
        fetchSample();
    }, [config.tableName]);

    const columns = config.displayColumns?.length ? config.displayColumns : (data.length > 0 ? Object.keys(data[0]) : []);

    // 🟢 ĐÂY LÀ PHẦN QUAN TRỌNG: PHẢI CÓ TỪ KHÓA 'return'
    return (
        <div className="h-full flex flex-col bg-[#050505] border-l border-white/5">
            <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0E0E0E]">
                <h4 className="text-xs text-orange-500 font-bold uppercase flex items-center gap-2">
                    <Eye size={14}/> Live Preview
                </h4>
            </div>
            
            <div className="flex-1 p-8 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] to-[#050505]">
                <div className="w-[300px] h-[300px] bg-black rounded-sm shadow-2xl border border-white/10 flex flex-col overflow-hidden relative group transition-all duration-300 hover:ring-1 hover:ring-orange-500/50">
                    
                    {/* Header giả lập */}
                    <div className="h-9 bg-[#0A0A0A] flex items-center justify-between px-3 select-none border-b border-white/5 shrink-0">
                        <div className="flex items-center gap-2.5 flex-1 justify-center relative">
                            <span className="opacity-50"><GripVertical size={14} className="text-[#D4C4B7]" /></span>
                            <div className="flex items-center gap-2">
                                <Layout size={14} className="text-blue-500"/>
                                <span className="font-bold text-[11px] tracking-wider text-[#D4C4B7] uppercase truncate max-w-[150px]">
                                    {config.title || 'TÊN MODULE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nội dung giả lập */}
                    <div className="flex-1 bg-[#101010] relative overflow-hidden p-0">
                        {loading ? <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-orange-500"/></div> :
                         !config.tableName ? <div className="flex h-full items-center justify-center text-gray-700 text-xs italic">Chưa cấu hình</div> :
                         data.length === 0 ? <div className="flex h-full items-center justify-center text-gray-600 text-xs">Trống</div> :
                         (
                            <>
                                {config.viewType === 'chart' && <ChartView data={data} groupBy={config.groupByColumn} />}
                                {config.viewType === 'bar' && <BarView data={data} groupBy={config.groupByColumn} />}
                                {config.viewType === 'kanban' && <KanbanWidget data={data} groupBy={config.groupByColumn} />}
                                {config.viewType === 'metric' && <MetricView data={data} />}
                                {config.viewType === 'list' && <ListView data={data} columns={columns} />}
                                {/* Đã xóa ButtonView */}
                            </>
                         )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
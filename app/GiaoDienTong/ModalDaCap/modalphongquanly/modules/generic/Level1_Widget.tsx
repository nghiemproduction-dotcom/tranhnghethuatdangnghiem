'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { PieChart, Loader2, Database, List, Hash, MousePointerClick, BarChart3 } from 'lucide-react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

import Widget_Chart from './widgets/Widget_Chart';
import Widget_List from './widgets/Widget_List';
import Widget_Stat from './widgets/Widget_Stat';
import Widget_Button from './widgets/Widget_Button';

interface Props {
    config: ModuleConfig;
    onClick: () => void;
}

export default function Level1_Widget_Generic({ config, onClick }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const VIEW_TYPE = config.viewType || 'chart';
    
    const groupByField = config.widgetData?.groupBy || 'trang_thai';
    const titleField = config.widgetData?.titleField || 'ho_ten';
    const subField = config.widgetData?.subField || 'so_dien_thoai';

    useEffect(() => {
        if (!config.bangDuLieu || VIEW_TYPE === 'button') {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const { count } = await supabase.from(config.bangDuLieu).select('*', { count: 'exact', head: true });
                setTotal(count || 0);

                if (VIEW_TYPE === 'list') {
                    const { data: res } = await supabase.from(config.bangDuLieu).select('*').order('created_at', { ascending: false }).limit(5);
                    setData(res || []);
                } else if (VIEW_TYPE === 'chart') {
                    const { data: res } = await supabase.from(config.bangDuLieu).select(groupByField).limit(100);
                    setData(res || []);
                }
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, [config.bangDuLieu, VIEW_TYPE, groupByField]);

    const renderIcon = () => {
        switch(VIEW_TYPE) {
            case 'list': return <List size={16}/>;
            case 'stat': return <Hash size={16}/>;
            case 'button': return <MousePointerClick size={16}/>;
            default: return <BarChart3 size={16}/>;
        }
    };

    if (VIEW_TYPE === 'button') {
        return <Widget_Button config={config} onClick={onClick} />;
    }

    return (
        <div 
            onClick={onClick}
            // 🟢 ĐÃ SỬA: Xóa hoàn toàn border, rounded-2xl, shadow
            // Chỉ giữ lại bg-[#161210] (màu nền) và hover:bg-[#1a120f] (hiệu ứng chuyển màu nền nhẹ)
            className="w-full h-full bg-[#161210] p-5 relative group cursor-pointer hover:bg-[#1a120f] transition-all overflow-hidden flex flex-col"
        >
            {/* Header */}
            <div className="flex justify-between items-start z-10 mb-1">
                <div className="flex items-center gap-2">
                    {/* 🟢 ĐÃ SỬA: Xóa rounded-lg, border của icon */}
                    <div className="p-2 bg-[#0a0807] text-[#C69C6D]">
                        {renderIcon()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[#5D4037] font-bold text-[10px] uppercase tracking-wider group-hover:text-[#E8D4B9] transition-colors max-w-[120px] truncate">
                            {config.tenModule}
                        </span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]" size={24}/></div>
            ) : (
                <>
                    {VIEW_TYPE === 'list' && <Widget_List data={data} titleField={titleField} subField={subField} loading={loading} />}
                    {VIEW_TYPE === 'stat' && <Widget_Stat total={total} loading={loading} label="Bản ghi" />}
                    {VIEW_TYPE === 'chart' && <Widget_Chart data={data} total={total} groupByField={groupByField} loading={loading} config={config} />}
                </>
            )}

            {/* 🟢 ĐÃ SỬA: Xóa rounded-full của hiệu ứng nền */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#C69C6D] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
        </div>
    );
}
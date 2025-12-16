'use client';

import React, { useState, useEffect } from 'react';
import { Database, Type, CheckSquare, BarChart3, PieChart, Activity, LayoutList, ChevronDown, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '../KieuDuLieuModule';

interface Props {
    config: ModuleConfig;
    setConfig: (val: any) => void;
}

export default function Buoc1_ChonNguon({ config, setConfig }: Props) {
    const [tables, setTables] = useState<string[]>([]);
    const [loadingTables, setLoadingTables] = useState(false);
    const [loadingCols, setLoadingCols] = useState(false);

    // 1. Load danh sách bảng
    useEffect(() => {
        const fetchTables = async () => {
            setLoadingTables(true);
            try {
                const { data, error } = await supabase.rpc('get_tables');
                if (data) setTables(data.map((t: any) => t.table_name));
            } catch (error) { console.error(error); } 
            finally { setLoadingTables(false); }
        };
        fetchTables();
    }, []);

    // 2. Chọn bảng
    const handleSelectTable = async (tableName: string) => {
        setLoadingCols(true);
        const newName = tableName.charAt(0).toUpperCase() + tableName.slice(1).replace(/_/g, ' ');
        setConfig((prev: any) => ({ ...prev, bangDuLieu: tableName, tenModule: newName || prev.tenModule }));

        try {
            const { data } = await supabase.rpc('get_table_columns', { t_name: tableName });
            if (data) {
                const colsConfig = data.map((col: any) => ({
                    key: col.column_name, label: col.column_name, kieuDuLieu: col.data_type, hienThiList: true, hienThiDetail: true
                }));
                setConfig((prev: any) => ({ ...prev, danhSachCot: colsConfig }));
            }
        } catch (err) { console.error(err); } 
        finally { setLoadingCols(false); }
    };

    const toggleColumn = (key: string) => {
        const newCols = config.danhSachCot.map(c => c.key === key ? { ...c, hienThiList: !c.hienThiList } : c);
        setConfig({ ...config, danhSachCot: newCols });
    };

    const updateWidgetData = (field: string, value: string) => {
        setConfig({ ...config, widgetData: { ...config.widgetData, [field]: value } });
    };

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-300">
            
            {/* 1. Chọn Bảng & Đặt Tên */}
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2"><Database size={14}/> 1. Chọn Bảng Dữ Liệu</label>
                    <div className="relative">
                        <select className="w-full bg-[#111] border border-white/10 rounded-none px-4 py-4 text-sm text-white appearance-none focus:border-blue-500 outline-none" value={config.bangDuLieu || ''} onChange={(e) => handleSelectTable(e.target.value)}>
                            <option value="">-- Chạm để chọn bảng --</option>
                            {tables.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="absolute right-4 top-4 text-gray-500 pointer-events-none">{loadingTables ? <Loader2 size={16} className="animate-spin"/> : <ChevronDown size={16}/>}</div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2"><Type size={14}/> 2. Tên Module</label>
                    <input type="text" value={config.tenModule || ''} onChange={(e) => setConfig({...config, tenModule: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-none px-4 py-4 text-sm text-white focus:border-blue-500 outline-none" placeholder="VD: Quản lý Nhân sự..." />
                </div>
            </div>

            <div className="w-full h-[1px] bg-white/5"></div>

            {/* 3. Cột Hiển Thị */}
            {config.bangDuLieu && (
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2"><CheckSquare size={14}/> 3. Cột Dữ Liệu</label>
                    {loadingCols ? <div className="text-xs text-gray-500 flex gap-2 p-4 bg-[#111] border border-white/10"><Loader2 size={14} className="animate-spin"/> Loading...</div> : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-[#050505] p-4 border border-white/10 max-h-60 overflow-y-auto custom-dark-scroll">
                            {config.danhSachCot?.map((col) => (
                                <div key={col.key} onClick={() => toggleColumn(col.key)} className={`group flex items-center justify-between p-2 rounded cursor-pointer border transition-all select-none ${col.hienThiList ? 'bg-blue-600/10 border-blue-500/50 text-blue-100' : 'bg-[#111] border-white/5 text-gray-600 hover:bg-white/5'}`}>
                                    <div className="flex items-center gap-2 truncate">{col.hienThiList ? <Eye size={14} className="text-blue-400"/> : <EyeOff size={14} className="text-gray-600"/>}<span className="text-xs font-medium truncate" title={col.key}>{col.key}</span></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 4. Widget */}
            {config.bangDuLieu && (
                <div className="space-y-4">
                    <div className="w-full h-[1px] bg-white/5"></div>
                    <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2"><BarChart3 size={14}/> 4. Giao Diện Widget</label>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            {id: 'list', label: 'Danh Sách', icon: <LayoutList size={20}/>},
                            {id: 'stat', label: 'Thống Kê Số', icon: <LayoutList size={20}/>},
                            {id: 'chart', label: 'Biểu Đồ Cột', icon: <BarChart3 size={20}/>, type: 'Bar'},
                            {id: 'chart', label: 'Biểu Đồ Đường', icon: <Activity size={20}/>, type: 'Line'},
                            {id: 'chart', label: 'Biểu Đồ Tròn', icon: <PieChart size={20}/>, type: 'Pie'},
                        ].map((opt, idx) => {
                            const isActive = config.viewType === opt.id && (!opt.type || config.widgetData?.chartType === opt.type);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setConfig({ ...config, viewType: opt.id, widgetData: { ...config.widgetData, chartType: opt.type } })}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 border transition-all ${isActive ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-[#111] border-white/10 text-gray-500 hover:bg-white/5'}`}
                                >
                                    {opt.icon}
                                    <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {config.viewType === 'chart' && (
                        <div className="bg-[#111] p-4 border border-white/10 mt-4 grid grid-cols-1 gap-4 animate-in slide-in-from-top-2">
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 font-bold uppercase">Trục Nhãn (Label)</label>
                                <select className="w-full bg-black border border-white/10 px-3 py-3 text-sm text-white outline-none appearance-none" onChange={(e) => updateWidgetData('labelField', e.target.value)}>
                                    <option value="">-- Chọn cột --</option>
                                    {/* 🟢 HIỆN TẤT CẢ CỘT (Kể cả không phải Text) */}
                                    {config.danhSachCot?.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 font-bold uppercase">Trục Giá Trị (Value)</label>
                                <select className="w-full bg-black border border-white/10 px-3 py-3 text-sm text-white outline-none appearance-none" onChange={(e) => updateWidgetData('valueField', e.target.value)}>
                                    <option value="">-- Chọn cột (Để trống nếu muốn đếm) --</option>
                                    {/* 🟢 SỬA LỖI: Bỏ filter, cho phép chọn MỌI CỘT để đếm */}
                                    {config.danhSachCot?.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
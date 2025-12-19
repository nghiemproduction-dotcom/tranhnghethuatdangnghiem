'use client';

import React from 'react';
import { BarChart3, SkipForward, Check } from 'lucide-react';
import { ModuleConfig } from '../KieuDuLieuModule';

interface Props {
    config: ModuleConfig;
    setConfig: (val: any) => void;
    onNext: () => void;
}

export default function Buoc1_CauHinhBang({ config, setConfig, onNext }: Props) {
    
    // Cập nhật cấu hình widget
    const updateWidget = (key: string, val: any) => {
        setConfig({
            ...config,
            widgetData: { ...config.widgetData, [key]: val }
        });
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F5E6D3] uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#C69C6D]"/> 1. Cấu Hình Biểu Đồ (Dashboard)
                </h3>
                {/* Nút Bỏ Qua */}
                <button 
                    onClick={() => {
                        // Reset widget config nếu bỏ qua
                        setConfig({ ...config, viewType: 'list' }); 
                        onNext();
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#8B5E3C] hover:text-[#C69C6D] uppercase border border-[#8B5E3C]/30 px-3 py-1.5 rounded hover:border-[#C69C6D] transition-all"
                >
                    Bỏ Qua Bước Này <SkipForward size={12}/>
                </button>
            </div>

            {/* Main Config */}
            <div className="flex-1 bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl p-6 overflow-y-auto custom-scroll">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Loại Biểu Đồ */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#8B5E3C] uppercase mb-3">Loại Hiển Thị</label>
                        <div className="space-y-3">
                            {['chart', 'stat'].map(type => (
                                <div 
                                    key={type}
                                    onClick={() => setConfig({ ...config, viewType: type })}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${config.viewType === type ? 'bg-[#C69C6D]/10 border-[#C69C6D]' : 'bg-[#0a0807] border-[#8B5E3C]/20 hover:bg-[#161210]'}`}
                                >
                                    <div>
                                        <span className="text-sm font-bold text-[#F5E6D3] uppercase">{type === 'chart' ? 'Biểu Đồ Trực Quan' : 'Thống Kê Số Liệu'}</span>
                                        <p className="text-[10px] text-[#8B5E3C] mt-1">{type === 'chart' ? 'Bar, Line, Pie chart...' : 'Tổng số, đếm...'}</p>
                                    </div>
                                    {config.viewType === type && <Check size={16} className="text-[#C69C6D]"/>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chi Tiết */}
                    {config.viewType === 'chart' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className="block text-[10px] font-bold text-[#8B5E3C] uppercase mb-2">Kiểu Biểu Đồ</label>
                                <select 
                                    value={config.widgetData?.chartType || 'Bar'}
                                    onChange={(e) => updateWidget('chartType', e.target.value)}
                                    className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded px-3 py-2 text-xs text-[#F5E6D3] outline-none focus:border-[#C69C6D]"
                                >
                                    <option value="Bar">Cột (Bar Chart)</option>
                                    <option value="Line">Đường (Line Chart)</option>
                                    <option value="Pie">Tròn (Pie Chart)</option>
                                    <option value="Area">Vùng (Area Chart)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-[#8B5E3C] uppercase mb-2">Trục Nhãn (Label)</label>
                                <select 
                                    value={config.widgetData?.labelField || ''}
                                    onChange={(e) => updateWidget('labelField', e.target.value)}
                                    className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded px-3 py-2 text-xs text-[#F5E6D3] outline-none focus:border-[#C69C6D]"
                                >
                                    <option value="">-- Chọn cột hiển thị tên --</option>
                                    {config.danhSachCot?.map(c => (
                                        <option key={c.key} value={c.key}>{c.label || c.key}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-[#8B5E3C] uppercase mb-2">Trục Giá Trị (Value)</label>
                                <select 
                                    value={config.widgetData?.valueField || ''}
                                    onChange={(e) => updateWidget('valueField', e.target.value)}
                                    className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded px-3 py-2 text-xs text-[#F5E6D3] outline-none focus:border-[#C69C6D]"
                                >
                                    <option value="">-- Mặc định: Đếm số lượng --</option>
                                    {config.danhSachCot?.filter(c => ['int4','int8','numeric','float4','float8'].includes(c.kieuDuLieu)).map(c => (
                                        <option key={c.key} value={c.key}>{c.label || c.key}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end shrink-0">
                <button onClick={onNext} className="px-8 py-2 bg-[#C69C6D] text-[#1a120f] font-bold text-xs uppercase rounded hover:bg-[#b08b5e] shadow-lg active:scale-95 transition-all">
                    Lưu & Tiếp Tục
                </button>
            </div>
        </div>
    );
}
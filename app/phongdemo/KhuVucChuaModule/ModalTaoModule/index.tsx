'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { X, Database, Save, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { ModuleConfig } from '../KieuDuLieuModule';

import { BasicConfig } from './BasicConfig';
import { ViewConfig } from './ViewConfig';
import { PreviewSection } from './PreviewSection';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (config: ModuleConfig) => void;
    initialData?: ModuleConfig;
}

// 🟢 CHỈ CÒN 2 BƯỚC
const STEPS = [
    { id: 1, title: 'Cấu hình Widget' },
    { id: 2, title: 'Cấu hình Mở rộng' },
];

export function ModalTaoModule({ isOpen, onClose, onCreate, initialData }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [tables, setTables] = useState<string[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [loadingTables, setLoadingTables] = useState(false);
    const [loadingCols, setLoadingCols] = useState(false);
    
    const [config, setConfig] = useState<Partial<ModuleConfig>>({
        viewType: 'list', modalViewType: 'table', tableName: '', title: '', displayColumns: []
    });

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1); 
            if (initialData) {
                setConfig(JSON.parse(JSON.stringify(initialData)));
            } else {
                setConfig({ viewType: 'list', modalViewType: 'table', tableName: '', title: '', displayColumns: [] });
                setColumns([]);
            }
            fetchTables();
        }
    }, [isOpen, initialData]);

    const fetchTables = async () => {
        setLoadingTables(true);
        try {
            const { data } = await supabase.rpc('get_tables');
            if (data) setTables(data.map((t: any) => t.table_name));
        } catch (err) { setTables(['nhan_su']); } 
        finally { setLoadingTables(false); }
    };

    useEffect(() => {
        if (!config.tableName) { setColumns([]); return; }
        const fetchCols = async () => {
            setLoadingCols(true);
            try {
                const { data } = await supabase.rpc('get_columns', { t_name: config.tableName });
                if (data) setColumns(data.map((c: any) => c.column_name));
                else {
                    const { data: sample } = await supabase.from(config.tableName!).select('*').limit(1);
                    if (sample && sample.length > 0) setColumns(Object.keys(sample[0]));
                }
            } catch (err) { setColumns([]); } 
            finally { setLoadingCols(false); }
        };
        fetchCols();
    }, [config.tableName]);

    const toggleColumn = (col: string) => {
        const current = config.displayColumns || [];
        setConfig({ ...config, displayColumns: current.includes(col) ? current.filter(c => c !== col) : [...current, col] });
    };

    const handleSelectAllCols = () => {
        if (config.displayColumns?.length === columns.length) setConfig({ ...config, displayColumns: [] }); 
        else setConfig({ ...config, displayColumns: [...columns] });
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!config.title) return alert("Vui lòng nhập Tên Module!");
            if (!config.tableName) return alert("Vui lòng chọn Bảng dữ liệu!");
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = () => {
        const finalConfig: ModuleConfig = {
            id: initialData?.id || `dynamic_${Date.now()}`,
            title: config.title!,
            tableName: config.tableName!,
            viewType: config.viewType || 'list',
            modalViewType: config.modalViewType || 'table',
            imageColumn: config.imageColumn,
            filterColumn: config.filterColumn,
            filterValue: config.filterValue,
            groupByColumn: config.groupByColumn,
            displayColumns: config.displayColumns,
        };
        onCreate(finalConfig);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 animate-in zoom-in-95 duration-200">
            <div className="w-full h-full md:w-[95vw] md:h-[95vh] bg-[#101010] border border-white/10 rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#151515] shrink-0">
                    <div className="flex items-center gap-6">
                        <h3 className="text-white font-bold uppercase text-lg tracking-wider flex items-center gap-3">
                            <Database size={20} className="text-blue-500"/> MODULE BUILDER <span className="text-[10px] bg-blue-900/50 px-2 py-0.5 rounded text-blue-300">LITE</span>
                        </h3>
                        <div className="flex items-center gap-2 bg-[#0A0A0A] p-1 rounded-full border border-white/10">
                            {STEPS.map((step) => {
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;
                                return (
                                    <div key={step.id} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isActive ? 'bg-white text-blue-600' : 'bg-white/10'}`}>{isCompleted ? <CheckCircle2 size={10}/> : step.id}</span>
                                        {step.title}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-full">
                    <div className="lg:col-span-7 h-full flex flex-col border-r border-white/5 bg-[#121212] relative overflow-hidden">
                        <div className="flex-1 overflow-y-auto   relative p-0">
                            <div className={`absolute inset-0 transition-opacity duration-300 ${currentStep === 1 ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
                                <BasicConfig config={config} setConfig={setConfig} tables={tables} columns={columns} loadingTables={loadingTables} initialData={initialData} toggleColumn={toggleColumn} handleSelectAllCols={handleSelectAllCols} />
                            </div>
                            <div className={`absolute inset-0 transition-opacity duration-300 ${currentStep === 2 ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
                                <ViewConfig config={config} setConfig={setConfig} columns={columns} />
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/10 bg-[#151515] flex justify-between shrink-0 z-20">
                            <button onClick={handleBack} disabled={currentStep===1} className="px-5 py-2.5 rounded-lg border border-white/10 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30 flex items-center gap-2"><ChevronLeft size={14}/> Quay lại</button>
                            {currentStep < 2 ? (
                                <button onClick={handleNext} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center gap-2">Tiếp tục <ChevronRight size={14}/></button>
                            ) : (
                                <button onClick={handleSubmit} className="px-10 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center gap-2 animate-pulse hover:animate-none"><Save size={14}/> Hoàn Tất</button>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-5 h-full bg-black hidden lg:block border-l border-white/5">
                        <PreviewSection config={config} />
                    </div>
                </div>
            </div>
        </div>
    );
}
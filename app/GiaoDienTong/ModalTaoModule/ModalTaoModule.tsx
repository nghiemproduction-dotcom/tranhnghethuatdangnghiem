'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Layers, Cpu, Database, Table as TableIcon, LayoutGrid, ShieldCheck, Settings } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '../KieuDuLieuModule';

// Import các bước (Đã tách rời)
import Buoc0_ChonNguon from './Buoc0_ChonNguon';
import Buoc1_CauHinhBang from './Buoc1_CauHinhBang';
import Buoc2_GiaoDienList from './Buoc2_GiaoDienList';
import Buoc3_GiaoDienDetail from './Buoc3_GiaoDienDetail';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ModuleConfig) => void;
  initialConfig?: ModuleConfig | null; 
  pageId: string;
}

const defaultNewConfig: Partial<ModuleConfig> = {
    tenModule: '', 
    bangDuLieu: '', 
    danhSachCot: [], 
    viewType: 'list', 
    widgetData: {}, 
    listConfig: {},
    moduleType: 'generic'
};

const STEPS = [
    { id: 0, label: 'CHỌN NGUỒN', icon: <Database size={12}/> },
    { id: 1, label: 'CẤU TRÚC BẢNG', icon: <TableIcon size={12}/> },
    { id: 2, label: 'GIAO DIỆN', icon: <LayoutGrid size={12}/> },
    { id: 3, label: 'PHÂN QUYỀN', icon: <ShieldCheck size={12}/> },
];

export default function ModalTaoModule({ isOpen, onClose, onSave, initialConfig, pageId }: Props) {
  const [mode, setMode] = useState<'wizard' | 'custom'>('wizard');
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Partial<ModuleConfig>>(defaultNewConfig);

  useEffect(() => {
      if (isOpen) { 
          if (initialConfig) {
              setConfig(initialConfig);
              if (initialConfig.moduleType === 'custom') {
                  setMode('custom');
              } else {
                  setMode('wizard');
                  // Nếu là sửa, nhảy thẳng vào bước cấu trúc bảng để review
                  setStep(1); 
              }
          } else {
              setConfig(defaultNewConfig); 
              setMode('wizard');
              setStep(0); 
          }
      }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const handleFinalSave = async () => {
    setLoading(true);
    try {
       const now = new Date();
       const ver = `v${now.getTime()}`;
       const moduleId = config.id || `mod_${Date.now()}`;
       
       const finalConfig: ModuleConfig = { 
           ...(config as ModuleConfig), 
           id: moduleId, 
           version: ver, 
           updatedAt: now.toISOString(),
           page_id: pageId 
        };

       // Upsert config vào DB
       const { error } = await supabase.from('cau_hinh_modules')
          .upsert({ 
              module_id: moduleId, 
              config_json: finalConfig, 
              version: ver, 
              page_id: pageId 
          });

       if (error) throw error;
       onSave(finalConfig); 
       onClose();
    } catch (err: any) { 
        alert("Lỗi lưu Module: " + err.message); 
    } finally { 
        setLoading(false); 
    }
  };

  const wrapperClass = "fixed inset-0 z-[980] flex items-center justify-center bg-[#110d0c]/95 backdrop-blur-xl p-4 pb-[80px] animate-in fade-in duration-200";
  const containerClass = "w-full max-w-[95vw] h-full max-h-[90vh] bg-[#0a0807] border border-[#8B5E3C]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative";

  // --- CUSTOM MODE ---
  if (mode === 'custom') {
      return (
        <div className={wrapperClass}>
            <div className={`${containerClass} max-w-4xl max-h-[600px]`}>
                <div className="h-16 border-b border-[#8B5E3C]/20 flex items-center justify-between px-6 bg-[#1a120f] shrink-0">
                    <div className="flex items-center gap-3">
                        <Cpu size={20} className="text-[#C69C6D]"/>
                        <span className="text-lg font-bold text-[#F5E6D3] uppercase tracking-widest">Cấu Hình Module Đặc Biệt</span>
                    </div>
                    <button onClick={onClose} className="p-2 text-[#8B5E3C] hover:text-white rounded-full hover:bg-white/10"><X size={24}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Giữ nguyên logic Custom Mode cũ hoặc thêm nội dung tùy ý */}
                    <div className="text-center text-[#8B5E3C]">Chế độ Custom Module (Đang cập nhật...)</div>
                </div>
            </div>
        </div>
      );
  }

  // --- WIZARD MODE ---
  return (
    <div className={wrapperClass}>
        <style jsx>{` .custom-scroll::-webkit-scrollbar { width: 4px; } .custom-scroll::-webkit-scrollbar-thumb { background: #8B5E3C; border-radius: 4px; } `}</style>
        
        <div className={containerClass}>
            {/* Header & Stepper */}
            <div className="h-16 border-b border-[#8B5E3C]/20 flex items-center justify-between px-6 bg-[#1a120f] shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#C69C6D]/10 rounded-lg text-[#C69C6D]"><Layers size={20}/></div>
                    <div>
                        <h2 className="text-sm font-bold text-[#F5E6D3] uppercase tracking-widest">{initialConfig ? 'Sửa Module' : 'Tạo Module Mới'}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {STEPS.map((s, idx) => (
                                <div key={s.id} className={`flex items-center gap-1 text-[9px] font-mono uppercase ${step === s.id ? 'text-[#C69C6D] font-bold' : step > s.id ? 'text-[#8B5E3C]' : 'text-[#5D4037]'}`}>
                                    {step > s.id ? <Check size={10}/> : <span>{idx + 1}.</span>}
                                    <span>{s.label}</span>
                                    {idx < STEPS.length - 1 && <span className="mx-1 opacity-20">/</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setStep(s => Math.max(0, s - 1))} 
                        disabled={step === 0} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-[#8B5E3C] hover:text-[#F5E6D3] hover:bg-white/5'}`}
                    >
                        <ArrowLeft size={12}/> Quay Lại
                    </button>

                    {/* Nút Tiếp Tục (Chỉ hiện ở bước 2, các bước khác có nút riêng trong component con) */}
                    {step === 2 && (
                        <button 
                            onClick={() => setStep(3)} 
                            className="flex items-center gap-2 px-6 py-2 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold text-xs uppercase rounded shadow-lg active:scale-95 transition-all"
                        >
                            Tiếp Tục <ArrowRight size={14}/>
                        </button>
                    )}

                    {/* Nút Hoàn Tất */}
                    {step === 3 && (
                        <button 
                            onClick={handleFinalSave} 
                            disabled={loading} 
                            className="flex items-center gap-2 px-6 py-2 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold text-xs uppercase rounded shadow-lg disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Đang Lưu...' : <><Check size={14}/> Hoàn Tất</>}
                        </button>
                    )}

                    <div className="w-[1px] h-6 bg-[#8B5E3C]/20 mx-2"></div>
                    <button onClick={onClose} className="p-2 text-[#8B5E3C] hover:text-red-400 rounded-full hover:bg-red-900/10 transition-colors"><X size={20}/></button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-[#0a0807]/50">
                <div className="absolute inset-0 overflow-y-auto p-6 custom-scroll">
                    {step === 0 && <Buoc0_ChonNguon config={config as ModuleConfig} setConfig={setConfig} onNext={() => setStep(1)} />}
                    {step === 1 && <Buoc1_CauHinhBang config={config as ModuleConfig} setConfig={setConfig} onNext={() => setStep(2)} />}
                    {step === 2 && <Buoc2_GiaoDienList config={config as ModuleConfig} setConfig={setConfig} />}
                    {step === 3 && <Buoc3_GiaoDienDetail config={config as ModuleConfig} setConfig={setConfig} />}
                </div>
            </div>
            
            {/* Progress Line */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-[#C69C6D] transition-all duration-500 shadow-[0_0_10px_#C69C6D]" style={{ width: `${((step + 1) / 4) * 100}%` }}></div>
        </div>
    </div>
  );
}
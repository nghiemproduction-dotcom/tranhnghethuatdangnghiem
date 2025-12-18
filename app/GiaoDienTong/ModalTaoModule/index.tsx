'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Layers } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '../KieuDuLieuModule';

import Buoc1_ChonNguon from './Buoc1_ChonNguon';
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
    tenModule: '', bangDuLieu: '', danhSachCot: [], viewType: 'list', widgetData: {}, listConfig: {}
};

export default function ModalTaoModule({ isOpen, onClose, onSave, initialConfig, pageId }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Partial<ModuleConfig>>(defaultNewConfig);

  useEffect(() => {
      if (isOpen) { setConfig(initialConfig || defaultNewConfig); setStep(1); }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const handleFinalSave = async () => {
    setLoading(true);
    try {
       const now = new Date();
       const ver = `v${now.getTime()}`;
       const moduleId = config.id || `mod_${Date.now()}`;
       const finalConfig: ModuleConfig = { ...(config as ModuleConfig), id: moduleId, version: ver, updatedAt: now.toISOString() };

       let dbCall;
       if (initialConfig?.id) {
           dbCall = supabase.from('cau_hinh_modules').update({ config_json: finalConfig, version: ver, page_id: pageId }).eq('module_id', moduleId);
       } else {
           dbCall = supabase.from('cau_hinh_modules').insert({ module_id: moduleId, config_json: finalConfig, version: ver, page_id: pageId });
       }
       const { error } = await dbCall; if (error) throw error;
       onSave(finalConfig); onClose();
    } catch (err: any) { alert("Lỗi: " + err.message); } finally { setLoading(false); }
  };

  return (
    // 🟢 FIX VỊ TRÍ: bottom-[clamp...]
    <div className="fixed top-0 left-0 right-0 bottom-[clamp(60px,15vw,80px)] z-[990] bg-[#050505] flex flex-col border-b border-[#8B5E3C]/30 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
      
      {/* HEADER */}
      <div className="h-[clamp(60px,15vw,70px)] border-b border-[#8B5E3C]/20 flex items-center justify-between px-6 shrink-0 bg-gradient-to-r from-transparent via-[#8B5E3C]/10 to-transparent">
          <div className="flex items-center gap-3">
             <Layers size={20} className="text-[#C69C6D]"/>
             <div className="flex flex-col">
                 <span className="text-xs font-bold text-[#F5E6D3] uppercase tracking-widest">{initialConfig ? 'CHỈNH SỬA MODULE' : 'TẠO MỚI MODULE'}</span>
                 <span className="text-[10px] text-[#8B5E3C] font-mono">Page: {pageId} • Bước {step}/3</span>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-[#8B5E3C] hover:text-[#C69C6D]"><X size={24}/></button>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-[2px] bg-[#1a120f]">
          <div className="h-full bg-[#C69C6D] transition-all duration-300 shadow-[0_0_10px_#C69C6D]" style={{ width: `${(step / 3) * 100}%` }}></div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 custom-scroll bg-[#0a0807]">
          {step === 1 && <Buoc1_ChonNguon config={config as ModuleConfig} setConfig={setConfig} />}
          {step === 2 && <Buoc2_GiaoDienList config={config as ModuleConfig} setConfig={setConfig} />}
          {step === 3 && <Buoc3_GiaoDienDetail config={config as ModuleConfig} setConfig={setConfig} />}
      </div>

      {/* FOOTER NAV */}
      <div className="h-[60px] bg-[#110d0c] border-t border-[#8B5E3C]/30 flex items-center justify-between px-6 shrink-0">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest p-2 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-[#8B5E3C] hover:text-[#C69C6D]'}`}>
            <ArrowLeft size={16}/> Quay Lại
          </button>

          {step < 3 ? (
             <button onClick={() => setStep(s => Math.min(3, s + 1))} className="flex items-center gap-2 px-6 py-2 bg-[#F5E6D3] text-[#1a120f] hover:bg-white active:scale-95 text-xs font-bold uppercase tracking-widest transition-all rounded-full shadow-lg">
               Tiếp Tục <ArrowRight size={16}/>
             </button>
          ) : (
             <button onClick={handleFinalSave} disabled={loading} className="flex items-center gap-2 px-8 py-2 bg-[#C69C6D] text-[#1a120f] hover:bg-[#b08b5e] active:scale-95 text-xs font-bold uppercase tracking-widest transition-all rounded-full shadow-[0_0_15px_rgba(198,156,109,0.3)]">
               {loading ? 'Lưu...' : <><Check size={16}/> Hoàn Tất</>}
             </button>
          )}
      </div>

    </div>
  );
}
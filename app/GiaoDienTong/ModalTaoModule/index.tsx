'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Layers } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '../KieuDuLieuModule';

// Import Steps
import Buoc1_ChonNguon from './Buoc1_ChonNguon';
import Buoc2_GiaoDienList from './Buoc2_GiaoDienList';
import Buoc3_GiaoDienDetail from './Buoc3_GiaoDienDetail';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ModuleConfig) => void;
  initialConfig?: ModuleConfig | null;
  // 🟢 THÊM PAGE ID
  pageId: string; 
}

const defaultNewConfig: Partial<ModuleConfig> = {
    tenModule: '',
    bangDuLieu: '',
    danhSachCot: [],
    viewType: 'list',
    widgetData: {},
    listConfig: {}
};

export default function ModalTaoModule({ isOpen, onClose, onSave, initialConfig, pageId }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Partial<ModuleConfig>>(defaultNewConfig);

  useEffect(() => {
      if (isOpen) {
          setConfig(initialConfig || defaultNewConfig);
          setStep(1);
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
           updatedAt: now.toISOString() 
       };

       let dbCall;
       if (initialConfig?.id) {
           // Update
           dbCall = supabase.from('cau_hinh_modules')
               .update({ 
                   config_json: finalConfig, 
                   version: ver,
                   page_id: pageId // 🟢 Update cả page_id cho chắc
               })
               .eq('module_id', moduleId);
       } else {
           // Insert mới
           dbCall = supabase.from('cau_hinh_modules')
               .insert({ 
                   module_id: moduleId, 
                   config_json: finalConfig, 
                   version: ver,
                   page_id: pageId // 🟢 Lưu page_id
               });
       }

       const { error } = await dbCall;
       if (error) throw error;

       onSave(finalConfig);
       onClose();
    } catch (err: any) { alert("Lỗi: " + err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-5xl h-[100dvh] md:h-[85vh] bg-[#050505] border-x border-y border-white/10 md:rounded-sm flex flex-col shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 md:px-6 shrink-0 bg-[#080808]">
          <div className="flex items-center gap-3">
             <Layers size={18} className="text-blue-600"/>
             <div className="flex flex-col">
                 <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {initialConfig ? 'CHỈNH SỬA MODULE' : 'TẠO MỚI MODULE'}
                 </span>
                 <span className="text-[10px] text-blue-500 font-mono">Page: {pageId} • Bước {step}/3</span>
             </div>
          </div>
          <button onClick={onClose} className="p-2 active:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
              <X size={24}/>
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-[2px] bg-[#111]">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-dark-scroll bg-black">
          {step === 1 && <Buoc1_ChonNguon config={config as ModuleConfig} setConfig={setConfig} />}
          {step === 2 && <Buoc2_GiaoDienList config={config as ModuleConfig} setConfig={setConfig} />}
          {step === 3 && <Buoc3_GiaoDienDetail config={config as ModuleConfig} setConfig={setConfig} />}
        </div>

        {/* FOOTER */}
        <div className="h-16 border-t border-white/10 bg-[#050505] flex items-center justify-between px-4 md:px-6 shrink-0 safe-area-bottom">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest p-2 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 active:text-white'}`}
          >
            <ArrowLeft size={16}/> Quay Lại
          </button>

          {step < 3 ? (
             <button 
               onClick={() => setStep(s => Math.min(3, s + 1))}
               className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 active:scale-95 text-xs font-bold uppercase tracking-widest transition-all rounded-sm"
             >
               Tiếp Tục <ArrowRight size={16}/>
             </button>
          ) : (
             <button 
               onClick={handleFinalSave}
               disabled={loading}
               className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white hover:bg-blue-500 active:scale-95 text-xs font-bold uppercase tracking-widest transition-all rounded-sm"
             >
               {loading ? 'Lưu...' : <><Check size={16}/> Hoàn Tất</>}
             </button>
          )}
        </div>

      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Minus, Plus, Users, Briefcase, FileText, Layers, X, Database, Edit } from 'lucide-react';

import BangNhanSu from '@/app/phongdemo/modulephongdemo/bangnhansu/BangNhanSu'; 
import ModuleDaNang from './ModuleDaNang';
import { ModuleConfig } from './KieuDuLieuModule';

interface Props {
  id: string;
  doRong: number;
  data: any[]; 
  isAdmin: boolean;
  onThayDoiDoRong: (id: string, thayDoi: number) => void;
  onXoaModule: (id: string) => void;
  // 🟢 THÊM PROP SỬA
  onSuaModule?: (id: string, currentConfig: ModuleConfig) => void;
}

export default function KhoiDon({ id, doRong, data, isAdmin, onThayDoiDoRong, onXoaModule, onSuaModule }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id, disabled: !isAdmin 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${doRong}`,
    zIndex: isDragging ? 999 : 'auto',
  };

  const isDynamic = id.startsWith('dynamic_');
  const dynamicConfig = isDynamic && data && data.length > 0 ? data[0] : null;

  const getHeaderInfo = () => {
    if (id === 'nhan_su') return { title: 'NHÂN SỰ', icon: <Users size={16} className="text-yellow-600" /> };
    if (isDynamic && dynamicConfig) return { title: dynamicConfig.title.toUpperCase(), icon: <Database size={16} className="text-blue-500" /> };
    return { title: 'MODULE', icon: <FileText size={16} className="text-gray-500" /> };
  };

  const { title, icon } = getHeaderInfo();

  const renderNoiDung = () => {
      if (id === 'nhan_su') return <div className="h-full bg-black"><BangNhanSu /></div>;
      if (isDynamic && dynamicConfig) {
          return <div className="h-full bg-black"><ModuleDaNang config={dynamicConfig} /></div>;
      }
      return <div className="flex-1 bg-black flex items-center justify-center text-gray-600 text-xs">Chưa tải</div>;
  };

  return (
    <div ref={setNodeRef} style={style} className={`group relative flex flex-col rounded-sm bg-black shadow-lg transition-all duration-300 max-md:!col-span-1 max-md:!w-full max-md:!h-[350px] ${isAdmin ? 'cursor-default' : ''} ${isDragging ? 'opacity-80 ring-2 ring-yellow-600 z-50' : ''}`}>
      
      {/* HEADER */}
      <div {...attributes} {...listeners} className={`h-9 bg-[#0A0A0A] flex items-center justify-between px-3 select-none shrink-0 ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        <div className="flex items-center gap-2.5 flex-1 justify-center relative">
            {isAdmin && <span className="opacity-50 group-hover:opacity-100 absolute left-0"><GripVertical size={14} className="text-[#D4C4B7]" /></span>}
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-bold text-[11px] tracking-wider text-[#D4C4B7] uppercase truncate max-w-[150px]">{title}</span>
            </div>
        </div>
        
        {isAdmin && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all absolute right-2" onPointerDown={(e) => e.stopPropagation()}>
                {/* 🟢 NÚT SỬA (CHỈ HIỆN CHO MODULE ĐỘNG) */}
                {isDynamic && dynamicConfig && onSuaModule && (
                    <button onClick={() => onSuaModule(id, dynamicConfig)} className="w-6 h-6 flex items-center justify-center rounded-sm bg-blue-900/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all mr-1">
                        <Edit size={12} />
                    </button>
                )}

                <div className="flex items-center bg-[#3A322C] rounded-sm overflow-hidden h-6">
                    <button onClick={() => onThayDoiDoRong(id, -1)} disabled={doRong <= 1} className="w-5 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white h-full"><Minus size={10} /></button>
                    <span className="text-[9px] font-mono text-white w-3 text-center bg-white/5 h-full flex items-center justify-center">{doRong}</span>
                    <button onClick={() => onThayDoiDoRong(id, 1)} className="w-5 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white h-full"><Plus size={10} /></button>
                </div>
                <button onClick={() => { if(confirm('Xóa?')) onXoaModule(id); }} className="w-6 h-6 ml-1 flex items-center justify-center rounded-sm bg-red-900/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"><X size={12} /></button>
            </div>
        )}
      </div>

      {renderNoiDung()}
    </div>
  );
}
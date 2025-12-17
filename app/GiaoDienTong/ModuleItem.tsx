'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, Trash2, Gauge, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModuleConfig } from './KieuDuLieuModule';
import Level1_Widget from './Level1_Widget';
import Level2_DanhSachModal from './Level2_DanhSachModal';

interface Props {
  id: string;
  data: ModuleConfig;
  isAdmin: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onResizeWidth: (delta: number) => void;
}

export default function ModuleItem({ 
    id, data, isAdmin, onDelete, onEdit, onResizeWidth 
}: Props) {
  const [showLevel2, setShowLevel2] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  // 🟢 Chiều rộng: 1 hoặc 2 (tối đa 2 theo yêu cầu mới)
  const colSpan = data.doRong || 1;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: '100%', // 🟢 Luôn cao 100% theo hàng chứa nó
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    '--item-span': colSpan,
  } as React.CSSProperties;

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        className="module-item relative flex flex-col bg-black border border-white/10 rounded-lg overflow-hidden group/module hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-200"
      >
        <style jsx>{`
            /* Mobile: Luôn 1 cột */
            .module-item { grid-column: span 1 !important; }
            /* Tablet/PC: Theo cấu hình (1 hoặc 2) */
            @media (min-width: 768px) {
                .module-item { grid-column: span var(--item-span) !important; }
            }
        `}</style>

        {/* HEADER */}
        <div className="h-8 px-2 flex items-center justify-between bg-black/80 border-b border-white/10 shrink-0 absolute top-0 left-0 right-0 z-20 opacity-0 group-hover/module:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 pl-1 overflow-hidden">
             <div {...attributes} {...listeners} className="text-gray-500 hover:text-white cursor-grab active:cursor-grabbing p-1">
                <GripVertical size={14} />
             </div>
             <div onClick={() => setShowLevel2(true)} className="flex items-center gap-2 font-bold text-[10px] text-gray-400 uppercase tracking-wider truncate cursor-pointer hover:text-blue-400 transition-colors">
                <Gauge size={12} className="shrink-0"/> 
                <span className="truncate">{data.tenModule}</span>
             </div>
          </div>

          {isAdmin && (
              <div className="flex items-center gap-1 shrink-0 ml-1">
                  {/* CHỈNH ĐỘ RỘNG (1 <-> 2) */}
                  <div className="flex items-center bg-[#151515] rounded border border-white/10 mr-1">
                    <button onClick={(e) => { e.stopPropagation(); onResizeWidth(-1); }} className="p-1 hover:text-white text-gray-500 border-r border-white/10 hover:bg-blue-500/20" title="Thu hẹp"><ChevronLeft size={12}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onResizeWidth(1); }} className="p-1 hover:text-white text-gray-500 hover:bg-blue-500/20" title="Mở rộng"><ChevronRight size={12}/></button>
                  </div>

                  <div className="flex items-center bg-[#151515] rounded border border-white/10">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 hover:text-blue-400 text-gray-600 border-r border-white/10"><Settings size={12}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:text-red-400 text-gray-600"><Trash2 size={12}/></button>
                  </div>
              </div>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-hidden relative pt-0 group-hover/module:pt-8 transition-all">
           <Level1_Widget config={data} onClick={() => setShowLevel2(true)} />
        </div>
      </div>

      <Level2_DanhSachModal isOpen={showLevel2} onClose={() => setShowLevel2(false)} config={data} />
    </>
  );
}
'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, Trash2, Gauge, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModuleConfig } from './KieuDuLieuModule';
import Level1_Widget from './Level1_Widget';

// 🟢 CẬP NHẬT ĐƯỜNG DẪN: Trỏ vào thư mục Level2 (nó sẽ tự tìm file index.tsx)
import Level2_DanhSachModal from './Level2';

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
  
  // Chiều rộng: 1 hoặc 2
  const colSpan = data.doRong || 1;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: '100%', 
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    '--item-span': colSpan,
  } as React.CSSProperties;

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        // Style: Kim loại tối, viền đồng, bóng đổ sâu
        className="module-item relative flex flex-col bg-[#110d0c] border border-[#8B5E3C]/30 rounded-xl overflow-hidden group/module hover:shadow-[0_0_25px_rgba(198,156,109,0.15)] hover:border-[#C69C6D]/60 transition-all duration-300"
      >
        <style jsx>{`
            /* Mobile: Luôn 1 cột */
            .module-item { grid-column: span 1 !important; }
            /* Tablet/PC: Theo cấu hình (1 hoặc 2) */
            @media (min-width: 768px) {
                .module-item { grid-column: span var(--item-span) !important; }
            }
            /* Fluid Font */
            .text-resp-xs { font-size: clamp(10px, 2.5vw, 12px); }
        `}</style>

        {/* HEADER: Chỉ hiện khi Hover hoặc Admin */}
        <div className="h-[clamp(28px,6vw,36px)] px-2 flex items-center justify-between bg-gradient-to-r from-[#1a120f] via-[#2a1e1b] to-[#1a120f] border-b border-[#8B5E3C]/20 shrink-0 absolute top-0 left-0 right-0 z-20 opacity-0 group-hover/module:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1 pl-1 overflow-hidden w-full">
             {/* Grip để kéo thả */}
             <div {...attributes} {...listeners} className="text-[#8B5E3C] hover:text-[#C69C6D] cursor-grab active:cursor-grabbing p-1 transition-colors">
                <GripVertical size={16} />
             </div>
             
             {/* Tên Module (Click mở Level 2) */}
             <div onClick={(e) => { e.stopPropagation(); setShowLevel2(true); }} className="flex-1 flex items-center gap-2 font-bold text-resp-xs text-[#C69C6D] uppercase tracking-wider truncate cursor-pointer hover:text-white transition-colors select-none">
                <Gauge size={14} className="shrink-0"/> 
                <span className="truncate">{data.tenModule}</span>
             </div>
          </div>

          {/* ADMIN CONTROLS */}
          {isAdmin && (
              <div className="flex items-center gap-1 shrink-0 ml-1">
                  {/* CHỈNH ĐỘ RỘNG */}
                  <div className="flex items-center bg-[#0a0807] rounded border border-[#8B5E3C]/30 mr-1">
                    <button onClick={(e) => { e.stopPropagation(); onResizeWidth(-1); }} className="p-1.5 hover:text-white text-[#8B5E3C] border-r border-[#8B5E3C]/30 hover:bg-[#C69C6D]/20 transition-colors" title="Thu hẹp"><ChevronLeft size={12}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onResizeWidth(1); }} className="p-1.5 hover:text-white text-[#8B5E3C] hover:bg-[#C69C6D]/20 transition-colors" title="Mở rộng"><ChevronRight size={12}/></button>
                  </div>

                  {/* EDIT / DELETE */}
                  <div className="flex items-center bg-[#0a0807] rounded border border-[#8B5E3C]/30">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 hover:text-[#C69C6D] text-[#8B5E3C] border-r border-[#8B5E3C]/30 hover:bg-[#C69C6D]/20 transition-colors" title="Cấu hình"><Settings size={12}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:text-red-400 text-red-900/70 hover:bg-red-900/20 transition-colors" title="Xóa"><Trash2 size={12}/></button>
                  </div>
              </div>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-hidden relative pt-0 group-hover/module:pt-[clamp(28px,6vw,36px)] transition-all duration-300">
           <Level1_Widget config={data} onClick={() => setShowLevel2(true)} />
        </div>
      </div>

      {/* MODAL LEVEL 2 (Gọi từ folder mới) */}
      <Level2_DanhSachModal isOpen={showLevel2} onClose={() => setShowLevel2(false)} config={data} />
    </>
  );
}
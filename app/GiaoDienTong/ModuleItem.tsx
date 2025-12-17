'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, Trash2, Gauge, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { ModuleConfig } from './KieuDuLieuModule';
import Level1_Widget from './Level1_Widget';
import Level2_DanhSachModal from './Level2_DanhSachModal';

interface Props {
  id: string;
  data: ModuleConfig;
  isAdmin: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onResize: (delta: number) => void; // Đã đổi tên đúng
  tabletSpan?: number;
}

export default function ModuleItem({ 
    id, 
    data, 
    isAdmin, 
    onDelete, 
    onEdit, 
    onResize, 
    tabletSpan 
}: Props) {
  const [showLevel2, setShowLevel2] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const currentHeightSpan = data.doCao || 5;
  // Ưu tiên dùng tabletSpan từ Grid truyền vào, nếu không có thì dùng doRong của module
  const desktopSpan = tabletSpan || data.doRong || 1;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    
    // ❌ QUAN TRỌNG: ĐÃ XÓA gridColumn Ở ĐÂY ĐỂ KHÔNG BỊ CƯỠNG CHẾ TRÊN MOBILE
    
    gridRow: `span ${currentHeightSpan}`,
    height: '100%',
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    
    // 🟢 MẸO: Truyền độ rộng mong muốn vào biến CSS
    '--desktop-span': desktopSpan,
  } as React.CSSProperties;

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        className="module-item relative flex flex-col bg-black border-r border-b border-white/10 group/module hover:z-10 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all duration-200"
      >
        {/* 🟢 LOGIC RESPONSIVE THỰC SỰ */}
        <style jsx>{`
            /* Mặc định (Mobile): Luôn chiếm 1 cột (Full width) */
            .module-item { grid-column: span 1 !important; } 
            
            /* Tablet & PC (từ 768px trở lên): Mới dùng độ rộng cấu hình */
            @media (min-width: 768px) {
                .module-item { grid-column: span var(--desktop-span) !important; }
            }
        `}</style>

        {/* HEADER */}
        <div className="h-9 px-2 flex items-center justify-between bg-black/60 border-b border-white/5 shrink-0 backdrop-blur-md absolute top-0 left-0 right-0 z-20">
          <div className="flex items-center gap-2 pl-1 overflow-hidden">
             <div {...attributes} {...listeners} className="text-gray-500 hover:text-white cursor-grab active:cursor-grabbing p-1">
                <GripVertical size={16} />
             </div>
             <div onClick={() => setShowLevel2(true)} className="flex items-center gap-2 font-bold text-[10px] text-gray-400 uppercase tracking-wider truncate cursor-pointer hover:text-blue-400 transition-colors">
                <Gauge size={12} className="shrink-0"/> 
                <span className="truncate">{data.tenModule}</span>
             </div>
          </div>

          {isAdmin && (
              <div className="flex items-center gap-1 shrink-0 ml-2">
                  <div className="flex flex-col bg-[#151515] rounded border border-white/10 mr-1">
                    <button onClick={(e) => { e.stopPropagation(); onResize(-1); }} className="p-0.5 hover:text-white text-gray-500 border-b border-white/10 hover:bg-blue-500/20 h-4 flex items-center justify-center w-6"><ChevronUp size={10}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onResize(1); }} className="p-0.5 hover:text-white text-gray-500 hover:bg-blue-500/20 h-4 flex items-center justify-center w-6"><ChevronDown size={10}/></button>
                  </div>
                  <div className="flex items-center bg-[#151515] rounded border border-white/10">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 hover:text-blue-400 text-gray-600 border-r border-white/10"><Settings size={14}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:text-red-400 text-gray-600"><Trash2 size={14}/></button>
                  </div>
              </div>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-hidden relative pt-9">
           <Level1_Widget config={data} onClick={() => setShowLevel2(true)} />
        </div>
      </div>

      <Level2_DanhSachModal isOpen={showLevel2} onClose={() => setShowLevel2(false)} config={data} />
    </>
  );
}
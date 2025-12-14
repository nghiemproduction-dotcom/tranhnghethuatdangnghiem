'use client';

import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KhoiDon from './KhoiDon';
import { GripVertical, Plus, Settings, Trash2, X } from 'lucide-react';

interface HangLuoiProps {
  id: string;
  items: string[];
  duLieuModule: { [key: string]: { doRong: number } };
  duLieuThat: { [key: string]: any[] };
  isAdmin: boolean;
  soCot: number;
  chieuCao: number;
  onDoiSoCotHang: (id: string, thayDoi: number) => void;
  onDoiDoRongModule: (id: string, thayDoi: number) => void;
  onThayDoiChieuCao: (id: string, chieuCao: number) => void;
  onXoaHang: (id: string) => void;
  onXoaModule: (id: string) => void;
  onSuaModule: (id: string, config: any) => void;
  onThemModule: () => void;
}

// Component con để bọc từng Module (Xử lý Drag & Drop)
function SortableItem({ id, children, width, isAdmin, isMobile }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // 🟢 QUAN TRỌNG: Nếu là Mobile thì luôn 100%, ngược lại thì theo tính toán
        width: isMobile ? '100%' : width, 
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group/module h-full transition-all duration-300">
            {children}
            {isAdmin && (
                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover/module:opacity-100 transition-opacity flex gap-1 z-50 bg-black/50 rounded-bl-lg backdrop-blur-sm" {...attributes} {...listeners}>
                    <GripVertical size={14} className="text-white cursor-grab active:cursor-grabbing" />
                </div>
            )}
        </div>
    );
}

export default function HangLuoi({ id, items, duLieuModule, duLieuThat, isAdmin, soCot, chieuCao, onDoiSoCotHang, onDoiDoRongModule, onThayDoiChieuCao, onXoaHang, onXoaModule, onSuaModule, onThemModule }: HangLuoiProps) {
  const { setNodeRef } = useDroppable({ id });
  const [rect, setRect] = useState<DOMRect | null>(null);

  // 🟢 LOGIC MỚI: Tự động phát hiện Mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
      const checkMobile = () => {
          setIsMobile(window.innerWidth < 768); // Dưới 768px coi là Mobile
      };
      
      // Chạy ngay lần đầu
      checkMobile();
      
      // Lắng nghe khi resize cửa sổ
      window.addEventListener('resize', checkMobile);
      const observer = new ResizeObserver((entries) => {
          for (const entry of entries) { setRect(entry.contentRect as DOMRect); }
      });
      const el = document.getElementById(id);
      if (el) observer.observe(el);

      return () => {
          window.removeEventListener('resize', checkMobile);
          observer.disconnect();
      };
  }, [id]);

  // Tính chiều rộng (Chỉ áp dụng cho Desktop)
  // Nếu chưa có rect (lần đầu render), mặc định chia đều
  const containerWidth = rect ? rect.width : 1200; 
  // Trừ đi khoảng cách gap (gap-2 = 8px)
  const gapTotal = (soCot - 1) * 8;
  const widthPerCol = (containerWidth - gapTotal) / soCot;

  return (
    <div 
        id={id} 
        ref={setNodeRef} 
        className={`
            relative group/hang transition-all duration-300 rounded-lg 
            ${isAdmin ? 'border border-dashed border-white/10 hover:border-white/30 bg-white/[0.02]' : ''}
            p-2
        `}
        style={{ 
            // 🟢 Mobile: Chiều cao tự động (auto) để nội dung dài ra
            // 🟢 Desktop: Chiều cao cố định theo cấu hình
            height: isMobile ? 'auto' : (items && items.length > 0 ? chieuCao : 'auto'),
            minHeight: isMobile ? '100px' : (items && items.length > 0 ? 'auto' : '150px')
        }}
    >
      {/* HEADER CỦA HÀNG (Chỉ hiện khi Admin) */}
      {isAdmin && (
        <div className="absolute -top-3 left-4 flex items-center gap-2 bg-[#1A1A1A] border border-white/20 px-2 py-0.5 rounded-full z-10 opacity-0 group-hover/hang:opacity-100 transition-opacity shadow-xl">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Khu vực {soCot} cột</span>
           <div className="h-3 w-[1px] bg-white/20"></div>
           <button onClick={() => onDoiSoCotHang(id, -1)} className="hover:text-white text-gray-400 px-1 text-[10px] font-mono font-bold">-</button>
           <span className="text-[10px] text-blue-400 font-bold">{soCot}</span>
           <button onClick={() => onDoiSoCotHang(id, 1)} className="hover:text-white text-gray-400 px-1 text-[10px] font-mono font-bold">+</button>
           <div className="h-3 w-[1px] bg-white/20"></div>
           <button onClick={() => onThayDoiChieuCao(id, chieuCao - 50)} className="hover:text-white text-gray-400 px-1 text-[10px] font-mono font-bold">H-</button>
           <span className="text-[10px] text-green-400 font-bold">{chieuCao}</span>
           <button onClick={() => onThayDoiChieuCao(id, chieuCao + 50)} className="hover:text-white text-gray-400 px-1 text-[10px] font-mono font-bold">H+</button>
           <div className="h-3 w-[1px] bg-white/20"></div>
           <button onClick={() => onXoaHang(id)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={10} /></button>
        </div>
      )}

      {/* 🟢 CONTAINER CHÍNH */}
      {/* Mobile: flex-col (xếp dọc) | Desktop: flex-row (xếp ngang) */}
      <div className="flex flex-col md:flex-row gap-2 h-full w-full">
        <SortableContext items={items || []} strategy={horizontalListSortingStrategy}>
          {items && items.map((itemId) => {
            const doRongModule = duLieuModule[itemId]?.doRong || 1;
            // Tính width cho Desktop
            const calculatedWidth = (widthPerCol * doRongModule) + ((doRongModule - 1) * 8);
            
            return (
              <SortableItem key={itemId} id={itemId} width={calculatedWidth} isAdmin={isAdmin} isMobile={isMobile}>
                <div className="relative w-full h-full">
                   {isAdmin && (
                       <div className="absolute top-1 left-1 z-50 flex gap-1 opacity-0 group-hover/module:opacity-100 transition-opacity">
                           <button onClick={() => onXoaModule(itemId)} className="bg-red-500/80 p-1 rounded-md text-white hover:bg-red-600"><X size={10} /></button>
                           <button onClick={() => onSuaModule(itemId, duLieuThat[itemId]?.[0])} className="bg-blue-500/80 p-1 rounded-md text-white hover:bg-blue-600"><Settings size={10} /></button>
                           {/* Nút chỉnh độ rộng Module (Chỉ hiện trên Desktop) */}
                           <div className="hidden md:flex bg-black/50 rounded-md items-center px-1">
                               <button onClick={(e) => { e.stopPropagation(); onDoiDoRongModule(itemId, -1); }} className="text-white text-[10px] px-1 hover:text-blue-400 font-bold">-</button>
                               <span className="text-[8px] text-gray-300 font-mono">W:{doRongModule}</span>
                               <button onClick={(e) => { e.stopPropagation(); onDoiDoRongModule(itemId, 1); }} className="text-white text-[10px] px-1 hover:text-blue-400 font-bold">+</button>
                           </div>
                       </div>
                   )}
                   <KhoiDon id={itemId} data={duLieuThat[itemId] || []} doRong={doRongModule} isAdmin={isAdmin} onThayDoiDoRong={() => {}} onXoaModule={() => {}} />
                </div>
              </SortableItem>
            );
          })}
        </SortableContext>
        
        {/* Nút thêm Module (Chỉ hiện khi Admin) */}
        {isAdmin && (
            <div className={`
                flex items-center justify-center rounded-lg border-2 border-dashed border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group/add
                ${items && items.length === 0 ? 'w-full h-[100px]' : 'w-10 min-w-[40px] md:h-full h-10'}
            `} onClick={onThemModule}>
                <Plus size={18} className="text-white/20 group-hover/add:text-blue-500 transition-colors" />
            </div>
        )}
      </div>
    </div>
  );
}
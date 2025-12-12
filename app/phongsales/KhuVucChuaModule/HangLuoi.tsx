'use client';

import React, { useState } from 'react';
import { useSortable, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import KhoiDon from '@/app/phongdemo/KhuVucChuaModule/KhoiDon';
import { Plus, Minus, Trash2, GripHorizontal } from 'lucide-react';

interface Props {
  id: string;
  soCot: number;
  chieuCao: number;
  items: string[];
  isAdmin: boolean;
  duLieuModule: { [key: string]: { doRong: number } };
  duLieuThat: { [key: string]: any[] };
  onDoiSoCotHang: (idHang: string, thayDoi: number) => void;
  onDoiDoRongModule: (idModule: string, thayDoi: number) => void;
  onThayDoiChieuCao: (idHang: string, chieuCaoMoi: number) => void;
  onXoaHang: (idHang: string) => void;
  onXoaModule: (idModule: string) => void;
}

export default function HangLuoi({ 
  id, soCot, chieuCao, items, isAdmin, duLieuModule, duLieuThat,
  onDoiSoCotHang, onDoiDoRongModule, onThayDoiChieuCao, onXoaHang, onXoaModule
}: Props) {
  
  const { setNodeRef, attributes, listeners, isDragging } = useSortable({
    id: id,
    data: { type: 'container' },
    disabled: !isAdmin
  });

  const [dangKeo, setDangKeo] = useState(false);

  const xuLyBatDauKeo = (e: React.PointerEvent) => {
    if (!isAdmin) return;
    e.stopPropagation(); e.preventDefault();
    setDangKeo(true);
    const startY = e.clientY;
    const startHeight = chieuCao;
    const xuLyKeoChuot = (ev: PointerEvent) => {
      const delta = ev.clientY - startY;
      onThayDoiChieuCao(id, Math.max(200, startHeight + delta));
    };
    const xuLyThaChuot = () => {
      setDangKeo(false);
      window.removeEventListener('pointermove', xuLyKeoChuot);
      window.removeEventListener('pointerup', xuLyThaChuot);
    };
    window.addEventListener('pointermove', xuLyKeoChuot);
    window.addEventListener('pointerup', xuLyThaChuot);
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners} 
      // mb-0 để không có khoảng cách thừa
      className={`group/row relative mb-0 transition-all
        ${isDragging ? 'opacity-40 grayscale' : ''}
        ${dangKeo ? 'z-50 cursor-row-resize' : ''}
      `}
      style={{ paddingBottom: '8px' }}
    >
        {isAdmin && (
            // Toolbar nằm nổi bật góc trên phải
            <div 
                className="absolute -top-7 right-0 h-6 flex flex-row items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-all duration-300 z-30 cursor-default"
                onPointerDown={(e) => e.stopPropagation()} 
            >
                <span className="text-[10px] text-[#D4C4B7]/40 uppercase tracking-widest mr-2">Cấu hình</span>

                <div className="flex flex-row items-center bg-[#2A2420] rounded-sm shadow-lg border border-[#D4C4B7]/10">
                    <button onClick={() => onDoiSoCotHang(id, -1)} className="px-2 py-1 hover:bg-[#D4C4B7]/10 text-yellow-500/80 transition-colors" title="Giảm cột"><Minus size={12} /></button>
                    <span className="text-[10px] font-mono text-[#D4C4B7] px-2 border-x border-[#D4C4B7]/10 bg-[#D4C4B7]/5 h-full flex items-center">{soCot} Cột</span>
                    <button onClick={() => onDoiSoCotHang(id, 1)} className="px-2 py-1 hover:bg-[#D4C4B7]/10 text-green-400/80 transition-colors" title="Thêm cột"><Plus size={12} /></button>
                </div>

                <button onClick={() => { if(confirm('Xóa hàng này?')) onXoaHang(id); }} className="p-1 rounded-sm bg-red-900/20 text-red-400/80 hover:bg-red-900/50 hover:text-red-400 transition-all shadow-lg" title="Xóa hàng">
                    <Trash2 size={12} />
                </button>
            </div>
        )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${soCot}, 1fr)`, 
          // 🟢 gap: '4px' -> Đều tăm tắp với padding tổng
          gap: '4px', 
          height: `${chieuCao}px`,
          gridAutoFlow: 'dense',
          transition: dangKeo ? 'none' : 'height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', 
        }}
        // Mobile ép 1 cột, gap vẫn 4px
        className="w-full max-md:!grid-cols-1 max-md:!h-auto max-md:!gap-1"
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {items.map((itemId) => (
            <KhoiDon 
              key={itemId} 
              id={itemId} 
              data={duLieuThat[itemId] || []}
              doRong={duLieuModule[itemId]?.doRong || 1}
              isAdmin={isAdmin}
              onThayDoiDoRong={onDoiDoRongModule}
              onXoaModule={onXoaModule} 
            />
          ))}
        </SortableContext>
      </div>

      {isAdmin && (
          <div onPointerDown={xuLyBatDauKeo} className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-4 flex items-center justify-center cursor-row-resize z-40 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 max-md:hidden`}>
              <div className={`h-1 rounded-full transition-all duration-300 flex items-center justify-center gap-1 ${dangKeo ? 'bg-yellow-600 w-full' : 'bg-[#D4C4B7]/20 hover:bg-yellow-600/50 w-24 hover:w-48'}`}>
                 <GripHorizontal size={12} className="text-[#D4C4B7]/50" />
              </div>
          </div>
      )}
    </div>
  );
}
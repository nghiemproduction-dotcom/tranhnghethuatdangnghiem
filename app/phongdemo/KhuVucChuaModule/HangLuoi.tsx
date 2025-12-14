'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import KhoiDon from './KhoiDon';
import { Minus, Plus, Trash2, Database } from 'lucide-react';
import { ModuleConfig } from './KieuDuLieuModule';

interface Props {
  id: string;
  soCot: number;
  chieuCao: number;
  items: string[];
  duLieuModule: { [key: string]: { doRong: number } };
  duLieuThat: any;
  isAdmin: boolean;
  onDoiSoCotHang: (rowId: string, thayDoi: number) => void;
  onDoiDoRongModule: (moduleId: string, thayDoi: number) => void;
  onThayDoiChieuCao: (rowId: string, chieuCaoMoi: number) => void;
  onXoaHang: (idHang: string) => void;
  onXoaModule: (idModule: string) => void;
  onSuaModule?: (id: string, currentConfig: ModuleConfig) => void;
  onThemModule?: () => void;
}

export default function HangLuoi({
  id, soCot, chieuCao, items = [], duLieuModule, duLieuThat, isAdmin,
  onDoiSoCotHang, onDoiDoRongModule, onThayDoiChieuCao, onXoaHang, onXoaModule, 
  onSuaModule, onThemModule
}: Props) {
  
  const { setNodeRef } = useDroppable({ id });
  const [isResizing, setIsResizing] = useState(false);

  // --- LOGIC KÉO GIÃN (DRAG RESIZE) - ĐÃ KHÔI PHỤC ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsResizing(true);

    const startY = e.clientY;
    const startHeight = chieuCao;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentY = moveEvent.clientY;
      const deltaY = currentY - startY;
      const newHeight = Math.max(100, startHeight + deltaY);
      onThayDoiChieuCao(id, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={`relative group/hang transition-all duration-300 ease-in-out mt-4 mb-2 ${isResizing ? 'select-none z-50' : ''}`}>
      
      {/* THANH CÔNG CỤ (Admin Only) */}
      {isAdmin && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 opacity-0 group-hover/hang:opacity-100 transition-opacity duration-200">
            {/* Nút Thêm Module (Tính năng mới) */}
            <button 
                onClick={onThemModule}
                className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 px-2 py-0.5 rounded-full shadow-lg border border-blue-400/30 transition-colors mr-1"
                title="Thêm Module"
            >
                <Database size={10} /> <span className="text-[9px] font-bold">THÊM</span>
            </button>

            {/* Các nút chỉnh cột cũ (Tính năng cũ) */}
            <div className="flex items-center bg-[#2A2420] border border-[#D4C4B7]/20 rounded-full px-2 py-0.5 shadow-lg">
                <button onClick={() => onDoiSoCotHang(id, -1)} disabled={soCot <= 1} className="p-1 hover:text-white text-gray-400 disabled:opacity-30"><Minus size={12}/></button>
                <span className="text-[10px] font-bold text-[#D4C4B7] mx-2 min-w-[40px] text-center">{soCot} CỘT</span>
                <button onClick={() => onDoiSoCotHang(id, 1)} className="p-1 hover:text-white text-gray-400"><Plus size={12}/></button>
            </div>

            <button onClick={() => { if(confirm("Xóa hàng này?")) onXoaHang(id); }} className="bg-red-900/80 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg border border-red-500/30 transition-colors ml-1">
                <Trash2 size={12} />
            </button>
        </div>
      )}

      {/* LƯỚI GRID (Responsive + Drag Height) */}
      <div 
        ref={setNodeRef}
        className={`
            grid gap-2 w-full transition-all duration-75 ease-linear border-b border-transparent
            max-sm:!grid-cols-1 max-md:!grid-cols-2 max-md:!h-auto max-md:!min-h-[200px]
            ${isAdmin ? 'border border-dashed border-[#D4C4B7]/10 bg-white/[0.01] rounded-sm' : ''}
            ${isResizing ? 'ring-1 ring-blue-500/30' : ''} 
        `}
        style={{
            gridTemplateColumns: `repeat(${soCot}, minmax(0, 1fr))`,
            // 🟢 QUAN TRỌNG: Dùng minHeight để hỗ trợ kéo giãn và nội dung dài
            minHeight: `${chieuCao}px`
        }}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {items.map((itemId) => (
            <KhoiDon
              key={itemId}
              id={itemId}
              doRong={duLieuModule[itemId]?.doRong || 1}
              data={duLieuThat[itemId] || []}
              isAdmin={isAdmin}
              onThayDoiDoRong={onDoiDoRongModule}
              onXoaModule={onXoaModule}
              onSuaModule={onSuaModule}
            />
          ))}
        </SortableContext>
        
        {items.length === 0 && isAdmin && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[#D4C4B7]/20 text-xs font-bold uppercase tracking-widest">Kéo thả module vào đây</span>
            </div>
        )}
      </div>

      {/* 🟢 THANH KÉO TỐI GIẢN (INVISIBLE RESIZER) - Đã trả lại */}
      {isAdmin && (
        <div 
            onMouseDown={handleMouseDown}
            className="absolute -bottom-1 left-0 w-full h-3 cursor-row-resize z-20 group/resizer flex items-end"
        >
            {/* Chỉ hiện 1 vạch mỏng màu xanh khi hover đúng vào mép */}
            <div className="w-full h-[2px] bg-transparent group-hover/resizer:bg-blue-500/50 transition-colors"></div>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { useSortable, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import KhoiDon from '@/app/phongdemo/KhuVucChuaModule/KhoiDon';

interface Props {
  id: string;
  soCot: number;
  chieuCao: number;
  items: string[];
  duLieuModule: { [key: string]: { doRong: number } };
  duLieuThat: { [key: string]: any[] };
  onDoiSoCotHang: (idHang: string, thayDoi: number) => void;
  onDoiDoRongModule: (idModule: string, thayDoi: number) => void;
  onThayDoiChieuCao: (idHang: string, chieuCaoMoi: number) => void;
  onXoaHang: (idHang: string) => void;
}

export default function HangLuoi({ 
  id, 
  soCot, 
  chieuCao, 
  items, 
  duLieuModule, 
  duLieuThat,
  onDoiSoCotHang, 
  onDoiDoRongModule,
  onThayDoiChieuCao,
  onXoaHang
}: Props) {
  
  const { setNodeRef, attributes, listeners, isDragging } = useSortable({
    id: id,
    data: { type: 'container' },
  });

  const [dangKeo, setDangKeo] = useState(false);

  const xuLyBatDauKeo = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    setDangKeo(true);
    const startY = e.clientY;
    const startHeight = chieuCao;
    const xuLyKeoChuot = (ev: PointerEvent) => {
      const delta = ev.clientY - startY;
      onThayDoiChieuCao(id, Math.max(150, startHeight + delta));
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
      // Giảm margin-bottom xuống còn mb-2 cho gọn
      className={`group/row relative mb-2 transition-all rounded-lg
        ${isDragging ? 'opacity-30' : ''}
        ${dangKeo ? 'z-50' : ''}
      `}
      style={{ paddingBottom: '10px' }}
    >
        {/* THANH CÔNG CỤ TRÁI (Đã kéo lại gần hơn: -left-9) */}
        <div 
            className="absolute top-0 -left-9 h-full w-8 flex flex-col justify-start pt-4 items-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 z-20 cursor-default"
            onPointerDown={(e) => e.stopPropagation()} 
        >
            <div className="flex flex-col gap-1 bg-gray-900/90 p-1 rounded-lg backdrop-blur-sm border border-gray-800 shadow-xl scale-90">
                <button onClick={() => onDoiSoCotHang(id, 1)} className="w-5 h-5 bg-gray-800 hover:bg-gray-700 text-green-500 rounded text-xs transition-colors" title="Thêm cột">+</button>
                <span className="text-[9px] text-gray-500 font-mono text-center py-0.5 font-bold">{soCot}</span>
                <button onClick={() => onDoiSoCotHang(id, -1)} className="w-5 h-5 bg-gray-800 hover:bg-gray-700 text-yellow-500 rounded text-xs transition-colors" title="Giảm cột">-</button>
            </div>

            <button 
                onClick={() => {
                    if(confirm('Bạn có chắc muốn xóa hàng này không?')) onXoaHang(id);
                }}
                className="mt-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-900/20 text-red-600 hover:bg-red-600 hover:text-white hover:scale-110 transition-all border border-red-900/30 scale-90"
                title="Xóa hàng này"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
        </div>

      {/* LƯỚI GRID */}
      <div
        style={{
          display: 'grid',
          // Mặc định Desktop dùng style này
          gridTemplateColumns: `repeat(${soCot}, 1fr)`, 
          gap: '12px', // Giảm khoảng cách giữa các module
          height: `${chieuCao}px`,
          gridAutoFlow: 'dense',
          transition: dangKeo ? 'none' : 'height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', 
        }}
        // QUAN TRỌNG: max-md:!grid-cols-1 sẽ đè style inline khi ở màn hình nhỏ
        className="w-full max-md:!grid-cols-1 max-md:!h-auto max-md:!gap-4"
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {items.map((itemId) => (
            <KhoiDon 
              key={itemId} 
              id={itemId} 
              data={duLieuThat[itemId] || []}
              doRong={duLieuModule[itemId]?.doRong || 1}
              onThayDoiDoRong={onDoiDoRongModule}
            />
          ))}
        </SortableContext>
      </div>

      {/* THANH KÉO */}
      <div 
        onPointerDown={xuLyBatDauKeo}
        className={`
            absolute bottom-0 left-0 w-full h-3 cursor-row-resize z-40 group/handle
            flex items-center justify-center
            max-md:hidden 
        `}
        // Ẩn thanh kéo trên mobile (max-md:hidden) vì mobile kéo chạm rất khó
        title="Kéo để chỉnh chiều cao"
      >
          <div className={`
            w-16 h-1 rounded-full transition-all duration-300
            ${dangKeo ? 'bg-blue-500 w-full opacity-50' : 'bg-gray-800/50 group-hover/handle:bg-blue-600 group-hover/handle:w-24'}
          `}></div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, Trash2, GripVertical, ChevronLeft, ChevronRight, Cpu, X, Gauge, Maximize2, Minimize2 } from 'lucide-react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

import Level1_Widget_Generic from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/level1generic/widget';
import Level2_Generic from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/level2generic/level2generic';
import Level3_FormChiTiet from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/level3generic/level3generic';

// 🟢 GIỮ NGUYÊN CÁC IMPORT ĐẶC BIỆT CỦA BẠN
 
import Level2_DanhSachModal from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/level2generic/level2generic';

// 🟢 FIX LỖI CHỚP MÀN HÌNH: Đưa Level2Wrapper ra ngoài component chính
const Level2Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-sm flex items-center justify-center pb-[80px] animate-in fade-in duration-200">
        <div className="w-[95vw] h-full max-h-[85vh] bg-[#0a0807] border border-[#8B5E3C]/30 overflow-hidden shadow-2xl relative flex flex-col">
            {children}
        </div>
    </div>
);

interface Props {
  id: string;
  data: ModuleConfig;
  isAdmin: boolean;
  onDelete: () => void;
  onEdit: (id: string) => void;
  onResizeWidth: (delta: number) => void;
  onOpenDetail?: (item: any, config: ModuleConfig) => void;
  onLevel2Toggle?: (isOpen: boolean) => void;
}

export default function ModuleItem({ 
    id, data, isAdmin, onDelete, onEdit, onResizeWidth, onOpenDetail, onLevel2Toggle 
}: Props) {
  const [showLevel2, setShowLevel2] = useState(false);
  const [customConfig, setCustomConfig] = useState<ModuleConfig | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const colSpan = data.doRong || 1;
  const rowHeight = data.rowHeight || 400; 
  const viewType = data.viewType || 'chart';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: `${rowHeight}px`, 
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    gridColumn: `span ${colSpan}`,
  } as React.CSSProperties;

  const handleToggleLevel2 = (show: boolean) => {
      setShowLevel2(show);
      if (onLevel2Toggle) onLevel2Toggle(show);
  };

  const nhanSuFullConfig: ModuleConfig = { ...data, tenModule: 'Quản Lý Nhân Sự', bangDuLieu: 'nhan_su', kieuHienThiList: 'table', listConfig: { groupByColumn: 'vi_tri' }, danhSachCot: data.danhSachCot || [] };

  const renderContent = () => {
 
      if (data.customId === 'custom_nhan_su') return  
      if (data.moduleType === 'generic') {
          if (viewType === 'direct_l2') {
             // 🟢 Xóa rounded, border
             return (
                 <div className="w-full h-full overflow-hidden bg-[#0F0C0B] flex flex-col">
                     <Level2_Generic isOpen={true} config={data} isEmbedded={true} onOpenDetail={onOpenDetail} />
                 </div>
             );
          }
          if (viewType === 'direct_l3') {
              // 🟢 Xóa rounded, border
              return (
                  <div className="w-full h-full overflow-hidden bg-[#0F0C0B] relative flex flex-col items-center justify-center group cursor-pointer hover:bg-[#1a120f] transition-colors" onClick={() => handleToggleLevel2(true)}>
                      <Cpu size={32} className="text-[#8B5E3C] mb-2 group-hover:text-[#C69C6D] transition-colors"/>
                      <span className="text-xs font-bold uppercase text-[#E8D4B9]">Form Nhập Liệu</span>
                      <div className="mt-2 px-3 py-1 bg-[#C69C6D] text-black text-[10px] font-bold shadow-lg uppercase group-hover:scale-105 transition-transform">Mở Ngay</div>
                  </div>
              );
          }
          return <Level1_Widget_Generic config={data} onClick={() => handleToggleLevel2(true)} />;
      }
      // 🟢 Fallback view: Vuông vức
      return <div className="w-full h-full flex flex-col items-center justify-center text-[#5D4037] bg-[#0a0807]"><Cpu size={32} className="mb-2 opacity-50"/><p className="text-xs font-bold uppercase text-center">{data.tenModule}</p></div>;
  };

  return (
    <>
      {/* 🟢 CONTAINER CHÍNH: Xóa rounded, border, shadow */}
      <div ref={setNodeRef} style={style} className="module-item relative flex flex-col bg-[#110d0c] overflow-hidden group/module transition-all duration-300">
        <style jsx>{`
            .module-item { grid-column: span 1 !important; } 
            @media (min-width: 640px) { .module-item { grid-column: span ${Math.min(colSpan, 2)} !important; } }
            @media (min-width: 1280px) { .module-item { grid-column: span ${colSpan} !important; } }
        `}</style>
        
        {/* Header Toolbar: Luôn hiển thị, xóa border-b để liền mạch */}
        <div className="h-[32px] px-2 flex items-center justify-between bg-gradient-to-r from-[#1a120f] via-[#2a1e1b] to-[#1a120f] shrink-0 absolute top-0 left-0 right-0 z-20 opacity-0 group-hover/module:opacity-100 transition-opacity duration-200 pointer-events-none group-hover/module:pointer-events-auto">
            <div className="flex items-center gap-1 pl-1 overflow-hidden w-full">
                <div {...attributes} {...listeners} className="text-[#8B5E3C] hover:text-[#C69C6D] cursor-grab active:cursor-grabbing p-1 transition-colors"><GripVertical size={16} /></div>
                <div className="flex-1 flex items-center gap-2 font-bold text-[10px] text-[#C69C6D] uppercase tracking-wider truncate cursor-default select-none"><Gauge size={14} className="shrink-0"/><span className="truncate">{data.tenModule}</span></div>
            </div>
            
            {isAdmin && (
                <div className="flex items-center gap-1 shrink-0 ml-1">
                    <div className="flex items-center bg-[#0a0807] mr-1 overflow-hidden">
                        <button onClick={(e) => { e.stopPropagation(); onResizeWidth(-1); }} className="p-1.5 hover:text-white text-[#8B5E3C] border-r border-[#8B5E3C]/30 hover:bg-[#C69C6D]/20"><Minimize2 size={10}/></button>
                        <button onClick={(e) => { e.stopPropagation(); onResizeWidth(1); }} className="p-1.5 hover:text-white text-[#8B5E3C] hover:bg-[#C69C6D]/20"><Maximize2 size={10}/></button>
                    </div>
                    <div className="flex items-center bg-[#0a0807] overflow-hidden">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(data.id); }} className="p-1.5 hover:text-[#C69C6D] text-[#8B5E3C] border-r border-[#8B5E3C]/30 hover:bg-[#C69C6D]/20"><Settings size={12}/></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:text-red-400 text-red-900/70 hover:bg-red-900/20"><Trash2 size={12}/></button>
                    </div>
                </div>
            )}
        </div>

        {/* Nội dung chính: Padding top cho Direct List để tránh bị che */}
        <div className={`flex-1 overflow-hidden relative transition-all duration-300 ${viewType === 'direct_l2' ? 'pt-[32px]' : 'pt-0'}`}>
           {renderContent()}
        </div>
      </div>

      {showLevel2 && (
          <Level2Wrapper>
              <button onClick={() => handleToggleLevel2(false)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-gray-400 hover:text-white rounded-full border border-white/10 hover:bg-red-900/50 hover:border-red-500/50 transition-all"><X size={24}/></button>
              {data.moduleType === 'generic' ? (
                  viewType === 'direct_l3' ? (
                      <Level3_FormChiTiet isOpen={true} onClose={() => handleToggleLevel2(false)} onSuccess={() => handleToggleLevel2(false)} config={data} userRole={'admin'} initialData={null} />
                  ) : (
                      <Level2_Generic isOpen={true} onClose={() => handleToggleLevel2(false)} config={data} onOpenDetail={onOpenDetail} />
                  )
              ) : (
                  <Level2_DanhSachModal isOpen={showLevel2} onClose={() => handleToggleLevel2(false)} config={customConfig || data} onOpenDetail={onOpenDetail} />
              )}
          </Level2Wrapper>
      )}
    </>
  );
}
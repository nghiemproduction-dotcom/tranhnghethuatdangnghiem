'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, Trash2, GripVertical, ChevronLeft, ChevronRight, Cpu, X, Gauge } from 'lucide-react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

import Level1_Widget from '@/app/GiaoDienTong/ModalDaCap/modalphongquanly/modules/quanlynhansu/Level1_Widget';
import Level2_DanhSachModal from '@/app/GiaoDienTong/ModalDaCap/modalphongquanly/modules/quanlynhansu/Level2/Level2';
import MSP_Widget from '@/app/GiaoDienTong/ModalDaCap/modalphongthietke/modules/mausanpham/MSP_Widget';
import MauSanPham from '@/app/GiaoDienTong/ModalDaCap/modalphongthietke/modules/mausanpham/mausanpham'; 
import NhanSuWidget from '@/app/GiaoDienTong/ModalDaCap/modalphongquanly/modules/quanlynhansu/NhanSuWidget';

const BANK_LIST = [
    "Vietcombank", "Techcombank", "MBBank", "ACB", "BIDV", "VietinBank", 
    "Agribank", "TPBank", "VPBank", "Sacombank", "HDBank", "VIB", 
    "SHB", "Eximbank", "MSB", "OCB", "SeABank", "Bac A Bank", "Nam A Bank"
];

interface Props {
  id: string;
  data: ModuleConfig;
  isAdmin: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onResizeWidth: (delta: number) => void;
  // 🟢 NHẬN HÀM MỞ CHI TIẾT
  onOpenDetail?: (item: any, config: ModuleConfig) => void;
}

export default function ModuleItem({ 
    id, data, isAdmin, onDelete, onEdit, onResizeWidth, onOpenDetail 
}: Props) {
  const [showLevel2, setShowLevel2] = useState(false);
  const [customConfig, setCustomConfig] = useState<ModuleConfig | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const colSpan = data.doRong || 1;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: '100%', 
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    '--item-span': colSpan,
  } as React.CSSProperties;

  // Cấu hình Nhân sự (Giữ nguyên như cũ)
  const nhanSuFullConfig: ModuleConfig = { ...data, tenModule: 'Quản Lý Nhân Sự', bangDuLieu: 'nhan_su', kieuHienThiList: 'table', listConfig: { groupByColumn: 'vi_tri' }, danhSachCot: data.danhSachCot || [] };

  const renderContent = () => {
      if (data.customId === 'custom_mau_san_pham') return <MSP_Widget onClick={() => setShowLevel2(true)} />;
      if (data.customId === 'custom_nhan_su') return <NhanSuWidget onClick={() => { setCustomConfig(nhanSuFullConfig); setShowLevel2(true); }} />;
      if (data.moduleType === 'custom') {
          return (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#5D4037] bg-[#0a0807] border border-[#8B5E3C]/20 border-dashed">
                <Cpu size={32} className="mb-2 opacity-50"/>
                <p className="text-xs font-bold uppercase text-center">{data.tenModule || 'Custom Module'}</p>
            </div>
          );
      }
      return <Level1_Widget config={data} onClick={() => setShowLevel2(true)} />;
  };

  const Level2Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="fixed inset-0 z-[990] bg-black/90 backdrop-blur-sm flex items-center justify-center pb-[80px] animate-in fade-in duration-200">
          <div className="w-[95vw] h-full max-h-[85vh] bg-[#0a0807] border border-[#8B5E3C]/30 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
              {children}
          </div>
      </div>
  );

  return (
    <>
      <div ref={setNodeRef} style={style} className="module-item relative flex flex-col bg-[#110d0c] border border-[#8B5E3C]/30 rounded-xl overflow-hidden group/module hover:shadow-[0_0_25px_rgba(198,156,109,0.15)] hover:border-[#C69C6D]/60 transition-all duration-300">
        <style jsx>{` .module-item { grid-column: span 1 !important; } @media (min-width: 768px) { .module-item { grid-column: span var(--item-span) !important; } } .text-resp-xs { font-size: clamp(10px, 2.5vw, 12px); } `}</style>
        
        <div className="h-[clamp(28px,6vw,36px)] px-2 flex items-center justify-between bg-gradient-to-r from-[#1a120f] via-[#2a1e1b] to-[#1a120f] border-b border-[#8B5E3C]/20 shrink-0 absolute top-0 left-0 right-0 z-20 opacity-0 group-hover/module:opacity-100 transition-opacity duration-200 pointer-events-none group-hover/module:pointer-events-auto">
          <div className="flex items-center gap-1 pl-1 overflow-hidden w-full">
             <div {...attributes} {...listeners} className="text-[#8B5E3C] hover:text-[#C69C6D] cursor-grab active:cursor-grabbing p-1 transition-colors"><GripVertical size={16} /></div>
             <div className="flex-1 flex items-center gap-2 font-bold text-resp-xs text-[#C69C6D] uppercase tracking-wider truncate cursor-default select-none">
                {data.moduleType === 'custom' ? <Cpu size={14} className="shrink-0"/> : <Gauge size={14} className="shrink-0"/>}
                <span className="truncate">{data.tenModule}</span>
             </div>
          </div>
          {isAdmin && (
              <div className="flex items-center gap-1 shrink-0 ml-1">
                  <div className="flex items-center bg-[#0a0807] rounded border border-[#8B5E3C]/30 mr-1">
                    <button onClick={(e) => { e.stopPropagation(); onResizeWidth(-1); }} className="p-1.5 hover:text-white text-[#8B5E3C] border-r border-[#8B5E3C]/30 hover:bg-[#C69C6D]/20"><ChevronLeft size={12}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onResizeWidth(1); }} className="p-1.5 hover:text-white text-[#8B5E3C] hover:bg-[#C69C6D]/20"><ChevronRight size={12}/></button>
                  </div>
                  <div className="flex items-center bg-[#0a0807] rounded border border-[#8B5E3C]/30">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 hover:text-[#C69C6D] text-[#8B5E3C] border-r border-[#8B5E3C]/30 hover:bg-[#C69C6D]/20"><Settings size={12}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:text-red-400 text-red-900/70 hover:bg-red-900/20"><Trash2 size={12}/></button>
                  </div>
              </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden relative pt-0 transition-all duration-300">
           {renderContent()}
        </div>
      </div>

      {showLevel2 && (
          <Level2Wrapper>
              <button onClick={() => setShowLevel2(false)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-gray-400 hover:text-white rounded-full border border-white/10 hover:bg-red-900/50 hover:border-red-500/50 transition-all"><X size={24}/></button>
              {data.customId === 'custom_mau_san_pham' ? <MauSanPham config={data} /> : 
                // 🟢 TRUYỀN HÀM onOpenDetail VÀO LEVEL 2
                <Level2_DanhSachModal isOpen={showLevel2} onClose={() => setShowLevel2(false)} config={customConfig || data} onOpenDetail={onOpenDetail} />
              }
          </Level2Wrapper>
      )}
    </>
  );
}
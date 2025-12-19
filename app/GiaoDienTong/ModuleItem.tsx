'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, Trash2, Gauge, GripVertical, ChevronLeft, ChevronRight, Cpu, X } from 'lucide-react';
import { ModuleConfig } from './KieuDuLieuModule';
import Level1_Widget from './Level1_Widget';
import Level2_DanhSachModal from '@/app/GiaoDienTong/Level2/Level2';

import MauSanPham from '@/app/modules/mausanpham/mausanpham';
import MSP_Widget from '@/app/modules/mausanpham/MSP_Widget';

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
  
  const colSpan = data.doRong || 1;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: '100%', 
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    '--item-span': colSpan,
  } as React.CSSProperties;

  const renderContent = () => {
      if (data.moduleType === 'custom') {
          if (data.customId === 'custom_mau_san_pham') {
              return <MSP_Widget onClick={() => setShowLevel2(true)} />;
          }
          return (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#5D4037] bg-[#0a0807]">
                <Cpu size={32} className="mb-2 opacity-50"/>
                <p className="text-xs font-bold uppercase tracking-widest text-center">Custom Module</p>
            </div>
          );
      }
      return <Level1_Widget config={data} onClick={() => setShowLevel2(true)} />;
  };

  // 🟢 Wrapper cho Modal Level 2 (Đẩy bottom lên 80px)
  const Level2Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="fixed inset-0 z-[990] bg-black/90 backdrop-blur-sm flex items-center justify-center pb-[80px] animate-in fade-in duration-200">
          <div className="w-[95vw] h-full max-h-[85vh] bg-[#0a0807] border border-[#8B5E3C]/30 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
              {children}
          </div>
      </div>
  );

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        className="module-item relative flex flex-col bg-[#110d0c] border border-[#8B5E3C]/30 rounded-xl overflow-hidden group/module hover:shadow-[0_0_25px_rgba(198,156,109,0.15)] hover:border-[#C69C6D]/60 transition-all duration-300"
      >
        <style jsx>{`
            .module-item { grid-column: span 1 !important; }
            @media (min-width: 768px) {
                .module-item { grid-column: span var(--item-span) !important; }
            }
            .text-resp-xs { font-size: clamp(10px, 2.5vw, 12px); }
        `}</style>

        {/* HEADER ITEM */}
        <div className="h-[clamp(28px,6vw,36px)] px-2 flex items-center justify-between bg-gradient-to-r from-[#1a120f] via-[#2a1e1b] to-[#1a120f] border-b border-[#8B5E3C]/20 shrink-0 absolute top-0 left-0 right-0 z-20 opacity-0 group-hover/module:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1 pl-1 overflow-hidden w-full">
             <div {...attributes} {...listeners} className="text-[#8B5E3C] hover:text-[#C69C6D] cursor-grab active:cursor-grabbing p-1 transition-colors">
                <GripVertical size={16} />
             </div>
             
             <div 
                onClick={(e) => { e.stopPropagation(); setShowLevel2(true); }} 
                className="flex-1 flex items-center gap-2 font-bold text-resp-xs text-[#C69C6D] uppercase tracking-wider truncate cursor-pointer hover:text-white transition-colors select-none"
             >
                {data.moduleType === 'custom' ? <Cpu size={14} className="shrink-0"/> : <Gauge size={14} className="shrink-0"/>}
                <span className="truncate">{data.tenModule}</span>
             </div>
          </div>

          {isAdmin && (
              <div className="flex items-center gap-1 shrink-0 ml-1">
                  <div className="flex items-center bg-[#0a0807] rounded border border-[#8B5E3C]/30 mr-1">
                    <button onClick={(e) => { e.stopPropagation(); onResizeWidth(-1); }} className="p-1.5 hover:text-white text-[#8B5E3C] border-r border-[#8B5E3C]/30 hover:bg-[#C69C6D]/20 transition-colors"><ChevronLeft size={12}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onResizeWidth(1); }} className="p-1.5 hover:text-white text-[#8B5E3C] hover:bg-[#C69C6D]/20 transition-colors"><ChevronRight size={12}/></button>
                  </div>
                  
                  {data.moduleType !== 'custom' && (
                      <div className="flex items-center bg-[#0a0807] rounded border border-[#8B5E3C]/30">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 hover:text-[#C69C6D] text-[#8B5E3C] border-r border-[#8B5E3C]/30 hover:bg-[#C69C6D]/20 transition-colors"><Settings size={12}/></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:text-red-400 text-red-900/70 hover:bg-red-900/20 transition-colors"><Trash2 size={12}/></button>
                      </div>
                  )}
              </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden relative pt-0 group-hover/module:pt-[clamp(28px,6vw,36px)] transition-all duration-300">
           {renderContent()}
        </div>
      </div>

      {/* --- MODAL LỚP 2 --- */}
      {showLevel2 && (
          <Level2Wrapper>
              <button 
                  onClick={() => setShowLevel2(false)} 
                  className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-gray-400 hover:text-white rounded-full border border-white/10 hover:bg-red-900/50 hover:border-red-500/50 transition-all"
              >
                  <X size={24}/>
              </button>
              
              {data.moduleType !== 'custom' ? (
                  <Level2_DanhSachModal isOpen={showLevel2} onClose={() => setShowLevel2(false)} config={data} />
              ) : data.customId === 'custom_mau_san_pham' ? (
                  <MauSanPham config={data} />
              ) : null}
          </Level2Wrapper>
      )}
    </>
  );
}
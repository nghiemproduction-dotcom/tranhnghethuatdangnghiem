'use client';

import React from 'react';
import { Trash2, Plus, Minus, PlusCircle, ArrowUpDown, LayoutGrid } from 'lucide-react';
import ModuleItem from './ModuleItem';
import { ModuleConfig } from './KieuDuLieuModule';

interface Props {
  sectionId: string;
  moduleIds: string[];
  dataMap: Record<string, ModuleConfig>;
  
  // Cấu hình
  height: number;
  tabletCols: number; // Số cột chia lưới trên Tablet
  
  isAdmin: boolean;
  
  // Actions
  onChangeHeight: (h: number) => void;
  onChangeTabletCols: (c: number) => void;
  onDeleteSection: () => void;
  onAddModule: () => void;
  
  // Module Actions
  onDeleteModule: (id: string) => void;
  onEditModule: (id: string, config: ModuleConfig) => void;
  onResizeModule: (id: string, delta: number) => void;
}

export default function GridSection({
    sectionId, moduleIds, dataMap, height, tabletCols, isAdmin,
    onChangeHeight, onChangeTabletCols, onDeleteSection, onAddModule,
    onDeleteModule, onEditModule, onResizeModule
}: Props) {

  return (
    <div className="relative group/section mb-0"> {/* mb-0 để liền mạch */}
      
      {/* TOOLBAR (Chỉ hiện khi hover vào vùng này) */}
      {isAdmin && (
        <div className="absolute top-0 left-0 right-0 h-0 flex justify-center z-50 opacity-0 group-hover/section:opacity-100 transition-opacity overflow-visible">
            <div className="absolute -top-6 bg-[#222] border border-white/20 rounded-full flex items-center px-3 py-1 shadow-2xl gap-4 transform translate-y-1/2">
                
                {/* 1. Chỉnh Cột Tablet */}
                <div className="flex items-center gap-2">
                    <LayoutGrid size={14} className="text-gray-500"/>
                    <div className="flex items-center bg-black rounded">
                        <button onClick={() => onChangeTabletCols(-1)} className="px-2 py-1 text-gray-400 hover:text-white">-</button>
                        <span className="text-xs font-bold text-blue-400 w-4 text-center">{tabletCols}</span>
                        <button onClick={() => onChangeTabletCols(1)} className="px-2 py-1 text-gray-400 hover:text-white">+</button>
                    </div>
                </div>

                {/* 2. Chỉnh Cao */}
                <div className="flex items-center gap-2">
                    <ArrowUpDown size={14} className="text-gray-500"/>
                    <div className="flex items-center bg-black rounded">
                        <button onClick={() => onChangeHeight(height - 50)} className="px-2 py-1 text-gray-400 hover:text-white">-</button>
                        <span className="text-xs font-bold text-green-400 w-8 text-center">{height}</span>
                        <button onClick={() => onChangeHeight(height + 50)} className="px-2 py-1 text-gray-400 hover:text-white">+</button>
                    </div>
                </div>

                {/* 3. Actions */}
                <button onClick={onAddModule} className="text-blue-500 hover:text-blue-400 font-bold text-xs uppercase flex items-center gap-1">
                    <PlusCircle size={14}/> Thêm
                </button>
                <button onClick={onDeleteSection} className="text-red-500 hover:text-red-400">
                    <Trash2 size={14}/>
                </button>
            </div>
        </div>
      )}

      {/* GRID CONTAINER */}
      <div 
        className="grid w-full bg-black transition-all"
        style={{
            // Mobile: 1 cột. Tablet (md): Theo cấu hình tabletCols
            gridTemplateColumns: `repeat(1, 1fr)`,
            // @ts-ignore - CSS variable hack cho media query
            '--tablet-cols': tabletCols,
            
            // Ép chiều cao cứng
            gridAutoRows: `${height}px`,
            gap: 0
        } as React.CSSProperties}
      >
        {/* CSS Media Query Hack để áp dụng cột cho Tablet trở lên */}
        <style jsx>{`
            @media (min-width: 768px) {
                div.grid { grid-template-columns: repeat(${tabletCols}, 1fr) !important; }
            }
        `}</style>

        {moduleIds.map(modId => {
            const config = dataMap[modId] || { id: modId, tenModule: 'Lỗi' };
            // Mặc định module chiếm 1 phần
            const span = config.doRong || 1; 
            
            return (
                <ModuleItem 
                    key={modId}
                    id={modId}
                    data={config}
                    tabletSpan={Math.min(span, tabletCols)} // Không được vượt quá số cột của lưới
                    isAdmin={isAdmin}
                    onDelete={() => onDeleteModule(modId)}
                    onEdit={() => onEditModule(modId, config)}
                    onResize={(delta) => onResizeModule(modId, delta)}
                />
            );
        })}
      </div>
    </div>
  );
}
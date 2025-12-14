'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import ModuleDaNang from './ModuleDaNang';
import { ModuleConfig } from './KieuDuLieuModule';

interface KhoiDonProps {
  id: string;
  data: ModuleConfig[];
  doRong: number;
  isAdmin: boolean;
  onThayDoiDoRong: (id: string, thayDoi: number) => void;
  onXoaModule: (id: string) => void;
}

export default function KhoiDon({ id, data, doRong, isAdmin }: KhoiDonProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  
  // Chỉ dùng transform cho drag overlay, không dùng cho layout chính để tránh vỡ
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const config = data && data.length > 0 ? data[0] : null;

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        className="h-full w-full bg-[#181818] rounded-xl border border-white/5 shadow-sm overflow-hidden flex flex-col hover:border-white/10 transition-colors"
        {...attributes} 
        {...listeners}
    >
        {config ? (
            <div className="flex-1 w-full h-full overflow-hidden">
                <ModuleDaNang config={config} />
            </div>
        ) : (
            // Placeholder khi chưa có config (Lỗi hoặc đang load)
            <div className="flex-1 flex items-center justify-center text-xs text-gray-600 font-mono bg-white/[0.02]">
                Empty Module ({id})
            </div>
        )}
    </div>
  );
}
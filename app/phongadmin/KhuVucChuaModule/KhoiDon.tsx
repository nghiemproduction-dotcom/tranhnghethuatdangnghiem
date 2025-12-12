'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Minus, Plus, Users, Briefcase, FileText, X } from 'lucide-react';

import BangNhanSu from '@/app/phongdemo/modulephongdemo/bangnhansu/BangNhanSu'; 

interface Props {
  id: string;
  doRong: number;
  data: any[];
  isAdmin: boolean;
  onThayDoiDoRong: (id: string, thayDoi: number) => void;
  onXoaModule: (id: string) => void;
}

export default function KhoiDon({ id, doRong, data, isAdmin, onThayDoiDoRong, onXoaModule }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id,
    disabled: !isAdmin 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${doRong}`,
    zIndex: isDragging ? 999 : 'auto',
  };

  const getHeaderInfo = () => {
    switch (id) {
        case 'nhan_su': return { title: 'QUẢN LÝ NHÂN SỰ', icon: <Users size={16} className="text-yellow-600" /> };
        case 'khach_hang': return { title: 'KHÁCH HÀNG', icon: <Briefcase size={16} className="text-yellow-500" /> };
        case 'viec_mau': return { title: 'VIỆC MẪU', icon: <FileText size={16} className="text-[#D4C4B7]" /> };
        default: return { title: id.toUpperCase(), icon: <FileText size={16} className="text-[#D4C4B7]" /> };
    }
  };

  const { title, icon } = getHeaderInfo();

  const renderNoiDung = () => {
      if (id === 'nhan_su') {
          return <div className="h-full w-full overflow-hidden bg-black"><BangNhanSu /></div>;
      }
      return (
        <div className="flex-1 overflow-auto p-0 scrollbar-hide bg-black">
            {(!data || data.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-[#D4C4B7]/30">
                    <span className="text-4xl mb-2 opacity-50">∅</span><span className="text-xs">Chưa có dữ liệu</span>
                </div>
            ) : (
                <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-[#111] z-10">
                        <tr className="text-[#D4C4B7]">
                            <th className="py-2 pl-4 font-semibold w-12">ID</th>
                            <th className="py-2 font-semibold">NỘI DUNG</th>
                            <th className="py-2 pr-4 text-right font-semibold">NGÀY</th>
                        </tr>
                    </thead>
                    <tbody className="text-[#D4C4B7]">
                        {data.slice(0, 50).map((item, index) => (
                            <tr key={index} className={`hover:bg-[#D4C4B7]/10 transition-colors group/row ${index % 2 === 0 ? 'bg-black' : 'bg-[#050505]'}`}>
                                <td className="py-2 pl-4 font-mono text-[#D4C4B7]/50 group-hover/row:text-[#D4C4B7] transition-colors">#{item.id}</td>
                                <td className="py-2 font-medium truncate max-w-[150px]">{item.ten || item.ho_ten || item.ten_khach_hang || item.noi_dung || 'N/A'}</td>
                                <td className="py-2 pr-4 text-right text-[#D4C4B7]/50 text-[10px]">{item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'}) : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      );
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`
        group relative flex flex-col
        
        // 🟢 rounded-sm (Bo nhẹ) + bg-black (Đen thui)
        rounded-sm 
        bg-black 
        shadow-lg
        
        transition-all duration-300 ease-in-out
        max-md:!col-span-1 max-md:!w-full max-md:!h-[350px]
        
        ${isAdmin ? 'cursor-default' : ''} 
        ${isDragging ? 'opacity-80 ring-2 ring-yellow-600 shadow-2xl scale-[1.02] z-50' : ''}
      `}
    >
      {/* HEADER */}
      <div 
        {...attributes} 
        {...listeners}
        className={`h-9 bg-[#0A0A0A] flex items-center justify-between px-3 select-none shrink-0 ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <div className="flex items-center gap-2.5 flex-1 justify-center relative">
            {isAdmin && <span className="opacity-50 group-hover:opacity-100 transition-opacity absolute left-0"><GripVertical size={14} className="text-[#D4C4B7]" /></span>}
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-bold text-[11px] tracking-wider text-[#D4C4B7] uppercase">{title}</span>
            </div>
            {id !== 'nhan_su' && <span className="text-[9px] text-[#D4C4B7]/70 bg-[#D4C4B7]/10 px-1.5 py-0.5 rounded-sm">{data?.length || 0}</span>}
        </div>
        
        {isAdmin && (
            <div 
                className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 absolute right-3"
                onPointerDown={(e) => e.stopPropagation()} 
            >
                <div className="flex items-center bg-[#3A322C] rounded-sm overflow-hidden">
                    <button onClick={() => onThayDoiDoRong(id, -1)} disabled={doRong <= 1} className="w-5 h-5 flex items-center justify-center hover:bg-[#D4C4B7]/10 text-[#D4C4B7]/60 hover:text-[#D4C4B7] disabled:opacity-30 transition-colors"><Minus size={10} /></button>
                    <span className="text-[9px] font-mono text-[#D4C4B7] w-3 text-center bg-[#D4C4B7]/5 h-5 leading-5">{doRong}</span>
                    <button onClick={() => onThayDoiDoRong(id, 1)} className="w-5 h-5 flex items-center justify-center hover:bg-[#D4C4B7]/10 text-[#D4C4B7]/60 hover:text-[#D4C4B7] transition-colors"><Plus size={10} /></button>
                </div>

                <button onClick={() => { if(confirm(`Xóa module ${title} khỏi màn hình?`)) onXoaModule(id); }} className="w-5 h-5 flex items-center justify-center rounded-sm bg-red-900/20 text-red-400/80 hover:bg-red-900/50 hover:text-red-400 transition-all" title="Xóa module">
                    <X size={12} />
                </button>
            </div>
        )}
      </div>

      {renderNoiDung()}

      <style jsx global>{` 
        .scrollbar-hide::-webkit-scrollbar { display: none; } 
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } 
      `}</style>
    </div>
  );
}
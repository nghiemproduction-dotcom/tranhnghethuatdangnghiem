'use client';
import React, { useMemo } from 'react';
import { Maximize2 } from 'lucide-react';
import { NhanSu } from './KieuDuLieu';

interface Props {
  data: NhanSu[];
  onClick: () => void;
}

export default function BieuDoThongKe({ data, onClick }: Props) {
  const thongKe = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(nv => { counts[nv.vi_tri] = (counts[nv.vi_tri] || 0) + 1; });
    return counts;
  }, [data]);

  const tongSo = data.length;
  const colors: Record<string, string> = {
    admin: '#a855f7', quanly: '#3b82f6', sales: '#eab308', 
    thosanxuat: '#22c55e', parttime: '#ef4444', congtacvien: '#64748b'
  };

  let currentPercent = 0;
  const gradientParts = Object.entries(thongKe).map(([key, count]) => {
    const percent = (count / tongSo) * 100;
    const color = colors[key] || '#666';
    const segment = `${color} ${currentPercent}% ${currentPercent + percent}%`;
    currentPercent += percent;
    return segment;
  });
  const gradientString = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div onClick={onClick} className="h-full flex flex-col items-center justify-center cursor-pointer p-4 hover:bg-white/5 transition-colors group">
        <div className="relative w-32 h-32 rounded-full mb-4 transition-transform group-hover:scale-105" 
             style={{ background: tongSo > 0 ? gradientString : '#333' }}>
            <div className="absolute inset-4 bg-[#111] rounded-full flex flex-col items-center justify-center text-white">
                 <span className="text-2xl font-bold">{tongSo}</span>
                 <span className="text-[10px] text-gray-400 uppercase">Nhân sự</span>
            </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 w-full px-2">
            {Object.entries(thongKe).map(([key, count]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs bg-white/5 px-2 py-1 rounded-full border border-white/5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[key] || '#666' }}></span>
                    <span className="text-gray-300 capitalize">{key}:</span>
                    <span className="text-white font-bold">{count}</span>
                </div>
            ))}
        </div>
        <div className="mt-4 text-xs text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 size={12} /> Xem chi tiết
        </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Table, LayoutGrid, Kanban, CheckCircle2, LayoutList, Loader2, AlertCircle, MoreHorizontal, Calendar, Tag } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '../KieuDuLieuModule';

interface Props {
    config: ModuleConfig;
    setConfig: (val: any) => void;
}

export default function Buoc2_GiaoDienList({ config, setConfig }: Props) {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (!config.bangDuLieu) return;
      const fetchData = async () => {
          setLoading(true);
          try {
              const { data } = await supabase.from(config.bangDuLieu).select('*').limit(6);
              if (data) setPreviewData(data);
          } catch (error) { console.error(error); } 
          finally { setLoading(false); }
      };
      fetchData();
  }, [config.bangDuLieu]);

  const displayTypes = [
    { id: 'table', label: 'Table List', icon: <Table size={20}/>, desc: 'Dữ liệu chi tiết' },
    { id: 'card', label: 'Grid Card', icon: <LayoutGrid size={20}/>, desc: 'Trực quan hóa' },
    { id: 'kanban', label: 'Kanban Board', icon: <Kanban size={20}/>, desc: 'Theo quy trình' },
  ];

  const visibleCols = config.danhSachCot?.filter(c => c.hienThiList) || [];

  // --- RENDER PREVIEW (CHUYÊN NGHIỆP) ---
  const renderPreview = () => {
      const type = config.kieuHienThiList || 'table';

      if (loading) return <div className="flex items-center justify-center h-40 text-gray-500 gap-2 text-xs"><Loader2 className="animate-spin" size={16}/> Đang tải dữ liệu mẫu...</div>;
      if (previewData.length === 0) return <div className="flex items-center justify-center h-40 text-gray-600 gap-2 text-xs"><AlertCircle size={16}/> Chưa có dữ liệu.</div>;

      // 1. TABLE (TINH CHỈNH)
      if (type === 'table') {
          return (
              <div className="w-full overflow-hidden border border-white/10 rounded bg-[#0a0a0a]">
                  <table className="w-full text-xs">
                      <thead className="bg-[#151515] text-gray-400 font-bold uppercase tracking-wider">
                          <tr>
                              <th className="py-3 px-4 text-center border-b border-white/10 w-12">#</th>
                              {visibleCols.slice(0, 4).map(col => (
                                  <th key={col.key} className="py-3 px-4 text-left border-b border-white/10">{col.label}</th>
                              ))}
                              <th className="py-3 px-4 text-center border-b border-white/10 w-16">...</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {previewData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                  <td className="py-3 px-4 text-center text-gray-600 font-mono">{idx + 1}</td>
                                  {visibleCols.slice(0, 4).map(col => (
                                      <td key={col.key} className="py-3 px-4 text-gray-300 truncate max-w-[150px] align-middle">
                                          {String(row[col.key] || '-')}
                                      </td>
                                  ))}
                                  <td className="py-3 px-4 text-center text-gray-600 group-hover:text-white cursor-pointer align-middle">
                                      <MoreHorizontal size={14} className="mx-auto"/>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          );
      }

      // 2. CARD (TINH CHỈNH)
      if (type === 'card') {
          const titleKey = visibleCols[0]?.key;
          const subKey = visibleCols[1]?.key; // Cột phụ 1
          const metaKey = visibleCols[2]?.key; // Cột phụ 2 (VD: Ngày tháng/Status)

          return (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {previewData.map((row, idx) => (
                      <div key={idx} className="bg-[#111] border border-white/10 p-4 rounded hover:border-blue-500/40 hover:bg-[#161616] transition-all group flex flex-col justify-between min-h-[100px]">
                          <div>
                              <div className="flex justify-between items-start mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                      {String(row[titleKey]).charAt(0).toUpperCase()}
                                  </div>
                                  <MoreHorizontal size={14} className="text-gray-700 group-hover:text-gray-400 cursor-pointer"/>
                              </div>
                              <h4 className="text-sm font-bold text-gray-200 truncate mb-1" title={String(row[titleKey])}>
                                  {String(row[titleKey] || 'No Title')}
                              </h4>
                              {subKey && <p className="text-[10px] text-gray-500 truncate">{String(row[subKey] || '-')}</p>}
                          </div>
                          
                          {metaKey && (
                              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[9px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <Tag size={10}/> {visibleCols[2].label}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono truncate max-w-[60px]">{String(row[metaKey])}</span>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          );
      }

      // 3. KANBAN (TINH CHỈNH)
      if (type === 'kanban') {
          // Tìm cột trạng thái
          const statusCol = visibleCols.find(c => ['status', 'trang_thai', 'state', 'loai'].some(k => c.key.toLowerCase().includes(k))) || visibleCols[visibleCols.length - 1];
          const titleKey = visibleCols[0]?.key;

          if (!statusCol) return <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-xs gap-2 border border-white/10 border-dashed rounded bg-[#111]"><AlertCircle size={16}/> Không tìm thấy cột trạng thái để phân nhóm.</div>;

          // Group Data
          const groups: Record<string, any[]> = {};
          previewData.forEach(row => {
              const val = String(row[statusCol.key] || 'Khác');
              if (!groups[val]) groups[val] = [];
              groups[val].push(row);
          });

          return (
              <div className="flex gap-3 h-52 overflow-x-auto pb-2 items-start">
                  {Object.entries(groups).slice(0, 4).map(([groupName, items], cIdx) => (
                      <div key={cIdx} className="min-w-[180px] w-[180px] bg-[#111] rounded border border-white/10 flex flex-col max-h-full">
                          {/* Kanban Header */}
                          <div className="p-2 border-b border-white/5 flex justify-between items-center bg-[#161616] rounded-t">
                              <span className="text-[10px] font-bold uppercase text-gray-400 truncate max-w-[120px]" title={groupName}>{groupName}</span>
                              <span className="bg-white/10 text-[9px] font-mono px-1.5 rounded text-gray-300">{items.length}</span>
                          </div>
                          {/* Kanban Body */}
                          <div className="p-2 space-y-2 overflow-y-auto custom-dark-scroll flex-1 bg-[#0a0a0a]">
                              {items.map((row, rIdx) => (
                                  <div key={rIdx} className="bg-[#1a1a1a] p-2 rounded border border-white/5 hover:border-blue-500/30 transition-all shadow-sm cursor-grab active:cursor-grabbing">
                                      <div className="text-[11px] font-medium text-gray-300 truncate mb-1">
                                          {String(row[titleKey] || 'Item')}
                                      </div>
                                      <div className="flex items-center justify-between">
                                          <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[8px] text-gray-500">
                                              {String(row[titleKey]).charAt(0)}
                                          </div>
                                          <span className="text-[8px] text-gray-600 font-mono">#{rIdx + 1}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
                  {/* Cột giả lập thêm */}
                  <div className="min-w-[180px] h-full border border-white/5 border-dashed rounded flex items-center justify-center text-gray-700 text-xs">
                      + Add Group
                  </div>
              </div>
          );
      }
  };

  return (
    <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-right-8 duration-300">
      
      {/* 1. CHỌN GIAO DIỆN */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
            <LayoutList size={14}/> 1. Chọn Giao Diện
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {displayTypes.map((type) => {
              const isSelected = config.kieuHienThiList === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setConfig({ ...config, kieuHienThiList: type.id })}
                  className={`
                    flex flex-row md:flex-col items-center justify-center md:justify-center gap-3 p-4 rounded border transition-all duration-200 group
                    ${isSelected 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20' 
                      : 'bg-[#111] border-white/10 text-gray-500 hover:bg-[#1a1a1a] hover:text-gray-300'}
                  `}
                >
                  <div className={isSelected ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}>{type.icon}</div>
                  <div className="text-left md:text-center">
                    <div className="font-bold text-xs uppercase tracking-wide">{type.label}</div>
                    <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-blue-100' : 'opacity-50'}`}>{type.desc}</div>
                  </div>
                  {isSelected && <div className="ml-auto md:ml-0 md:hidden"><CheckCircle2 size={16}/></div>}
                </button>
              );
          })}
        </div>
      </div>

      <div className="w-full h-[1px] bg-white/5"></div>

      {/* 2. LIVE PREVIEW */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
            <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={14}/> 2. Xem Trước (Live Preview)
            </label>
            <span className="text-[9px] text-gray-600 font-mono hidden sm:block">
                Source: <span className="text-gray-400">{config.bangDuLieu}</span>
            </span>
        </div>
        
        {/* Khung Preview: Nền tối, có texture nhẹ */}
        <div className="bg-[#080808] p-4 rounded border border-white/10 min-h-[220px] relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
            
            <div className="relative z-10">
                {renderPreview()}
            </div>
        </div>
      </div>

    </div>
  );
}
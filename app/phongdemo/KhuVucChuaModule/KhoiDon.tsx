'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 1. IMPORT CÁC MODULE CON VÀO ĐÂY
// (Ông nhớ chỉnh đường dẫn '../' cho đúng vị trí thư mục nhé)
import BangNhanSu from '@/app/phongdemo/modulephongdemo/bangnhansu/BangNhanSu'; 

interface Props {
  id: string;
  doRong: number;
  data: any[];
  onThayDoiDoRong: (id: string, thayDoi: number) => void;
}

export default function KhoiDon({ id, doRong, data, onThayDoiDoRong }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${doRong}`,
    zIndex: isDragging ? 999 : 'auto',
  };

  const getTitle = () => {
    if (id === 'nhan_su') return '👥 Quản Lý Nhân Sự'; // Đổi tên cho ngầu
    if (id === 'khach_hang') return '🤝 Khách Hàng';
    if (id === 'viec_mau') return '🎨 Việc Mẫu';
    return id;
  };

  // 2. HÀM RENDER NỘI DUNG THÔNG MINH
  // Hàm này quyết định xem sẽ vẽ cái gì bên trong khối
  const renderNoiDung = () => {
      
      // TRƯỜNG HỢP ĐẶC BIỆT: NẾU LÀ KHỐI NHÂN SỰ
      if (id === 'nhan_su') {
          return (
             // Gọi Module BangNhanSu vào đây
             // Lưu ý: Ta bọc div để reset lại style nếu cần thiết
             <div className="h-full w-full overflow-hidden">
                 <BangNhanSu />
             </div>
          );
      }

      // TRƯỜNG HỢP MẶC ĐỊNH: HIỂN THỊ BẢNG DỮ LIỆU CŨ (Cho các khối chưa có module riêng)
      return (
        <div className="flex-1 overflow-auto p-3 scrollbar-custom text-xs">
            {(!data || data.length === 0) ? (
                <div className="h-full flex items-center justify-center text-gray-700 italic">Trống...</div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-800 text-[10px] uppercase tracking-wider">
                            <th className="py-2 pl-1 font-normal">ID</th>
                            <th className="py-2 font-normal">Nội dung</th>
                            <th className="py-2 font-normal text-right pr-1">Ngày</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-400">
                        {data.slice(0, 50).map((item, index) => (
                            <tr key={index} className="border-b border-gray-800/40 hover:bg-blue-500/5 hover:text-blue-200 transition-colors">
                                <td className="py-2 pl-1 truncate max-w-[40px] opacity-50">#{item.id}</td>
                                <td className="py-2 font-medium truncate max-w-[140px]">
                                    {item.ten || item.ho_ten || item.ten_khach_hang || item.noi_dung || 'N/A'}
                                </td>
                                <td className="py-2 text-right pr-1 opacity-60">
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'}) : '-'}
                                </td>
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
        rounded-xl border border-gray-800 bg-[#111] 
        text-gray-200 overflow-hidden
        transition-all duration-300 ease-in-out
        ${isDragging ? 'opacity-50 ring-2 ring-blue-500 shadow-2xl' : 'hover:border-gray-700 hover:bg-[#161616]'}
      `}
    >
      {/* Header Module (Tay cầm để kéo thả) */}
      <div 
        {...attributes} 
        {...listeners}
        className="h-11 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none shrink-0"
      >
        <span className="font-bold text-sm text-blue-400 flex items-center gap-2">
            {getTitle()} 
            {/* Ẩn số lượng nếu là module custom vì nó tự quản lý */}
            {id !== 'nhan_su' && (
                <span className="text-gray-600 text-[10px] bg-gray-800 px-1.5 py-0.5 rounded-full">{data?.length || 0}</span>
            )}
        </span>
        
        {/* Nút chỉnh độ rộng */}
        <div 
           className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
           onPointerDown={(e) => e.stopPropagation()} 
        >
             <button onClick={() => onThayDoiDoRong(id, -1)} disabled={doRong <= 1} className="w-6 h-6 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">-</button>
             <span className="text-[10px] text-gray-500 flex items-center px-1">Size:{doRong}</span>
             <button onClick={() => onThayDoiDoRong(id, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">+</button>
        </div>
      </div>

      {/* 3. GỌI HÀM RENDER NỘI DUNG Ở ĐÂY */}
      {renderNoiDung()}

      {/* CSS Scrollbar */}
      <style jsx>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent; 
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #333; 
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #555; 
        }
      `}</style>
    </div>
  );
}
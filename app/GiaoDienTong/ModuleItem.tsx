'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, Trash2, GripVertical, ChevronLeft, ChevronRight, Cpu, X, Gauge } from 'lucide-react';
import { ModuleConfig } from './DashboardBuilder/KieuDuLieuModule';

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
}

export default function ModuleItem({ 
    id, data, isAdmin, onDelete, onEdit, onResizeWidth 
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

  // 🟢 CẤU HÌNH CHI TIẾT & AUDIT LOG CHO NHÂN SỰ
  const nhanSuFullConfig: ModuleConfig = {
      ...data,
      tenModule: 'Quản Lý Nhân Sự',
      bangDuLieu: 'nhan_su',
      kieuHienThiList: 'table', 
      listConfig: { groupByColumn: 'vi_tri' },
      danhSachCot: [
          // 1. SYSTEM ID
          { key: 'id', label: 'ID Hệ Thống', kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true, tuDong: true, readOnly: true, permRead: ['all'], permEdit: [] },
          
          // 2. AUDIT TRAIL (Lịch sử - Ẩn khỏi list chính, hiện ở tab Lịch sử)
          { key: 'nguoi_tao', label: 'Người Tạo', kieuDuLieu: 'text', hienThiList: false, hienThiDetail: false, readOnly: true, permRead: ['admin', 'quanly'], permEdit: [] },
          { key: 'ngay_tao', label: 'Ngày Tạo', kieuDuLieu: 'datetime', hienThiList: false, hienThiDetail: false, readOnly: true, permRead: ['admin', 'quanly'], permEdit: [] },
          { key: 'nguoi_sua_cuoi', label: 'Người Sửa Cuối', kieuDuLieu: 'text', hienThiList: false, hienThiDetail: false, readOnly: true, permRead: ['admin', 'quanly'], permEdit: [] },
          { key: 'ngay_sua_cuoi', label: 'Lần Sửa Cuối', kieuDuLieu: 'datetime', hienThiList: false, hienThiDetail: false, readOnly: true, permRead: ['admin', 'quanly'], permEdit: [] },

          // 3. THÔNG TIN CHÍNH
          { key: 'hinh_anh', label: 'Ảnh đại diện', kieuDuLieu: 'image', hienThiList: true, hienThiDetail: true, permRead: ['all'], permEdit: ['admin', 'quanly', 'owner'] },
          { key: 'ho_ten', label: 'Họ và Tên', kieuDuLieu: 'text', formatType: 'capitalize', hienThiList: true, hienThiDetail: true, batBuoc: true, permRead: ['all'], permEdit: ['admin', 'quanly', 'owner'] },
          { key: 'cccd', label: 'Số CCCD/CMND', kieuDuLieu: 'text', hienThiList: false, hienThiDetail: true, permRead: ['admin', 'quanly', 'owner'], permEdit: ['admin', 'quanly', 'owner'] },
          { key: 'vi_tri', label: 'Vị Trí', kieuDuLieu: 'select_dynamic', allowNewOption: true, hienThiList: true, hienThiDetail: true, batBuoc: true, permRead: ['all'], permEdit: ['admin', 'quanly'] },
          
          // 4. LIÊN HỆ
          { key: 'so_dien_thoai', label: 'Số Điện Thoại', kieuDuLieu: 'text', formatType: 'phone', hienThiList: true, hienThiDetail: true, batBuoc: true, permRead: ['all'], permEdit: ['admin', 'quanly', 'owner'] },
          { key: 'email', label: 'Email', kieuDuLieu: 'text', formatType: 'email', hienThiList: true, hienThiDetail: true, batBuoc: true, permRead: ['all'], permEdit: ['admin', 'quanly', 'owner'] },
          { key: 'ngay_sinh', label: 'Ngày Sinh', kieuDuLieu: 'date', hienThiList: false, hienThiDetail: true, batBuoc: true, permRead: ['admin', 'quanly', 'owner'], permEdit: ['admin', 'quanly', 'owner'] },
          { key: 'dia_chi', label: 'Địa Chỉ', kieuDuLieu: 'text', formatType: 'location', hienThiList: false, hienThiDetail: true, permRead: ['admin', 'quanly', 'owner'], permEdit: ['admin', 'quanly', 'owner'] },
          
          // 5. TÀI CHÍNH
          { key: 'ngan_hang', label: 'Ngân Hàng', kieuDuLieu: 'select_dynamic', options: BANK_LIST, allowNewOption: true, hienThiList: false, hienThiDetail: true, batBuoc: true, permRead: ['admin', 'quanly', 'owner'], permEdit: ['admin', 'quanly', 'owner'] },
          { key: 'so_tai_khoan', label: 'Số Tài Khoản', kieuDuLieu: 'text', hienThiList: false, hienThiDetail: true, batBuoc: true, permRead: ['admin', 'quanly', 'owner'], permEdit: ['admin', 'quanly', 'owner'] },
          { key: 'luong_thang', label: 'Lương Tháng', kieuDuLieu: 'currency', inputMultiplier: 100000, hienThiList: false, hienThiDetail: true, permRead: ['admin', 'quanly', 'owner'], permEdit: ['admin', 'quanly'] },
          { key: 'tien_cong', label: 'Tiền Công / Giờ', kieuDuLieu: 'currency', readOnly: true, hienThiList: false, hienThiDetail: true, computedCode: 'row.luong_thang ? Math.round(row.luong_thang / 24 / 8) : 0', permRead: ['admin', 'quanly', 'owner'], permEdit: [] },
          { key: 'thuong_doanh_thu', label: 'Thưởng Doanh Thu', kieuDuLieu: 'percent', hienThiList: false, hienThiDetail: true, permRead: ['admin', 'quanly', 'owner'], permEdit: ['admin', 'quanly'] },
          
          // 6. KHÁC
          { key: 'hop_dong', label: 'Hồ Sơ Hợp Đồng', kieuDuLieu: 'link_array', hienThiList: false, hienThiDetail: true, permRead: ['admin', 'quanly', 'owner'], permEdit: ['admin', 'quanly'] },
          { key: 'trang_thai', label: 'Trạng Thái', kieuDuLieu: 'select_dynamic', options: ['Đang làm việc', 'Thử việc', 'Đã nghỉ'], allowNewOption: true, hienThiList: true, hienThiDetail: true, permRead: ['all'], permEdit: ['admin', 'quanly'] },
      ],
      virtualColumns: [
          { key: 'viec_mau_da_tao', label: 'Việc Mẫu Đã Tạo', type: 'related_list', targetTable: 'thu_vien_viec_mau', matchColumn: 'nguoi_tao' }
      ]
  };

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
              {data.customId === 'custom_mau_san_pham' ? <MauSanPham config={data} /> : <Level2_DanhSachModal isOpen={showLevel2} onClose={() => setShowLevel2(false)} config={customConfig || data} />}
          </Level2Wrapper>
      )}
    </>
  );
}
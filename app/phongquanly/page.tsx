'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Filter, Download, Search, MoreHorizontal, CheckCircle2, 
    Clock, AlertCircle, ShoppingBag, Users 
} from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';

// IMPORT NHÂN SỰ
import NhanSuManager from './nhansu';

// --- CONSTANTS ---
const ROOM_TABS = [
  { key: 'quanly', label: 'Phòng Quản Lý', path: '/phongquanly', available: true },
  { key: 'parttime', label: 'Phòng Parttime', path: '/phongparttime', available: true },
  { key: 'sanxuat', label: 'Phòng Sản Xuất', path: '/phongsanxuat', available: false },
  { key: 'sales', label: 'Phòng Sales', path: '/phongsales', available: false },
  { key: 'ctv', label: 'Phòng Cộng Tác Viên', path: '/phongctv', available: false },
];

// CHỈ CÒN 2 CHỨC NĂNG CHÍNH
const MAIN_FUNCTIONS = [
    { id: 'orders', label: 'Quản Lý Đơn Hàng', icon: ShoppingBag },
    { id: 'hr', label: 'Quản Lý Nhân Sự', icon: Users },
];

const ORDER_FILTERS = [
  { key: 'all', label: 'Tất Cả' },
  { key: 'pending', label: 'Chờ Duyệt' },
  { key: 'processing', label: 'Đang Xử Lý' },
  { key: 'approved', label: 'Đã Duyệt' },
  { key: 'completed', label: 'Hoàn Thành' },
  { key: 'report', label: 'Báo Cáo' },
];

const MOCK_DATA = Array.from({ length: 15 }).map((_, i) => ({
    id: `DH-${2025001 + i}`,
    khachHang: i % 3 === 0 ? "Nguyễn Văn A (Khách VIP)" : "Trần Thị B",
    sanPham: i % 2 === 0 ? "Tranh Gạo Chân Dung Khổ Lớn Cao Cấp" : "Tranh Phong Cảnh",
    tongTien: (5000000 + i * 100000).toLocaleString('vi-VN') + " VNĐ",
    ngayTao: `0${(i % 9) + 1}/01/2025`,
    trangThai: i % 4 === 0 ? "Hoàn thành" : i % 3 === 0 ? "Chờ duyệt" : "Đang xử lý",
    ghiChu: i % 3 === 0 ? "Giao hàng giờ hành chính, gọi trước 30p" : "Không có"
}));

// 🟢 ĐỊNH NGHĨA PROPS RÕ RÀNG ĐỂ TRÁNH LỖI TS 2322
interface Props { 
    isChildComponent?: boolean; 
    externalActiveTab?: string; 
}

export default function PhongQuanLy({ isChildComponent = false, externalActiveTab }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // STATE UI
  const [activeFunction, setActiveFunction] = useState('orders'); 
  const [activeOrderFilter, setActiveOrderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 🟢 ĐỒNG BỘ VỚI ADMIN
  useEffect(() => {
      if (externalActiveTab) {
          setActiveFunction(externalActiveTab);
      }
  }, [externalActiveTab]);

  const handleRoomTabClick = (tabKey: string, path: string, available: boolean) => {
    if (!available) return;
    if (tabKey !== 'quanly') router.push(path);
  };

  useEffect(() => {
    if (isChildComponent) {
        setLoading(false);
        return;
    }
    const userInfo = localStorage.getItem('USER_INFO');
    if (userInfo) {
      try { setUser(JSON.parse(userInfo)); setLoading(false); }
      catch (e) { setTimeout(() => { setLoading(false); }, 500); }
    } else { setTimeout(() => { setLoading(false); }, 500); }
  }, [isChildComponent]);

  const renderTrangThai = (status: string) => {
      let colorClass = "bg-gray-500/20 text-gray-400 border-gray-500/30";
      let Icon = Clock;
      if (status === 'Hoàn thành') { colorClass = "bg-green-500/20 text-green-400 border-green-500/30"; Icon = CheckCircle2; } 
      else if (status === 'Chờ duyệt') { colorClass = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"; Icon = AlertCircle; } 
      else if (status === 'Đang xử lý') { colorClass = "bg-blue-500/20 text-blue-400 border-blue-500/30"; Icon = Clock; }
      return (
          <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClass} font-bold text-xs uppercase tracking-wide w-fit whitespace-nowrap`}>
              <Icon size={14} /> {status}
          </span>
      );
  };

  if (loading && !isChildComponent) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C69C6D]"></div></div>;
  
  // COMPONENT NỘI DUNG CHÍNH
  const MainContent = () => (
    <div className={`flex flex-col w-full h-full bg-[#121212] overflow-hidden ${isChildComponent ? 'rounded-none border-0 shadow-none' : 'border border-white/10 rounded-2xl shadow-2xl mt-8'}`}>
            
            {/* 1. THANH CHỨC NĂNG (Chỉ hiện khi chạy ĐỘC LẬP) */}
            {!externalActiveTab && (
                <div className="flex items-center gap-2 p-3 bg-[#1a1a1a] border-b border-white/10">
                    {MAIN_FUNCTIONS.map(func => {
                        const Icon = func.icon;
                        const isActive = activeFunction === func.id;
                        return (
                            <button
                                key={func.id}
                                onClick={() => setActiveFunction(func.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border
                                    ${isActive ? 'bg-[#C69C6D]/10 text-[#C69C6D] border-[#C69C6D]/30' : 'bg-transparent text-white/50 border-transparent hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <Icon size={14} /> {func.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* 2. NỘI DUNG */}
            <div className="flex-1 overflow-hidden relative">
                
                {/* VIEW: NHÂN SỰ */}
                {activeFunction === 'hr' && (
                    <div className="absolute inset-0">
                        <NhanSuManager />
                    </div>
                )}

                {/* VIEW: ĐƠN HÀNG */}
                {activeFunction === 'orders' && (
                    <div className="flex flex-col h-full">
                        {/* Sub-header */}
                        <div className="p-4 border-b border-white/10 bg-[#121212] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto">
                                {ORDER_FILTERS.map((tab) => (
                                    <button key={tab.key} onClick={() => setActiveOrderFilter(tab.key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${activeOrderFilter === tab.key ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-white/50 hover:text-white'}`}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative group flex-1 md:w-56">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                                    <input type="text" placeholder="Tìm đơn hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#C69C6D]" />
                                </div>
                                <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/80"><Filter size={14} /></button>
                                <button className="p-2 bg-[#C69C6D]/10 border border-[#C69C6D]/30 rounded-lg hover:bg-[#C69C6D]/20 text-[#C69C6D]"><Download size={14} /></button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto bg-[#0a0a0a] relative custom-scrollbar">
                            <table className="w-full border-collapse min-w-[900px]">
                                <thead className="sticky top-0 z-10 bg-[#151515] shadow-md border-b border-white/10">
                                    <tr>
                                        {['Mã Đơn', 'Khách Hàng', 'Sản Phẩm', 'Ngày Tạo', 'Tổng Tiền', 'Trạng Thái', 'Ghi Chú', 'Hành Động'].map((header, idx) => (
                                            <th key={idx} className="px-4 py-3 text-left text-[11px] font-bold text-[#C69C6D] uppercase tracking-wider whitespace-nowrap bg-[#151515]">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {MOCK_DATA.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-4 py-3 text-xs font-mono text-white/80 whitespace-nowrap bg-transparent">{row.id}</td>
                                            <td className="px-4 py-3 text-xs font-semibold text-white whitespace-nowrap bg-transparent">{row.khachHang}</td>
                                            <td className="px-4 py-3 text-xs text-white/70 whitespace-nowrap max-w-[150px] truncate bg-transparent" title={row.sanPham}>{row.sanPham}</td>
                                            <td className="px-4 py-3 text-xs text-white/60 whitespace-nowrap bg-transparent">{row.ngayTao}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-[#C69C6D] whitespace-nowrap font-mono bg-transparent">{row.tongTien}</td>
                                            <td className="px-4 py-3 whitespace-nowrap bg-transparent">{renderTrangThai(row.trangThai)}</td>
                                            <td className="px-4 py-3 text-xs text-white/50 italic whitespace-nowrap max-w-[120px] truncate bg-transparent" title={row.ghiChu}>{row.ghiChu}</td>
                                            <td className="px-4 py-3 whitespace-nowrap bg-transparent">
                                                <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white"><MoreHorizontal size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="h-10 w-full"></div>
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-t border-white/10 bg-[#1a1a1a] flex justify-between items-center shrink-0 text-[10px] text-white/60">
                            <span>Hiển thị 15 / 128</span>
                            <div className="flex gap-1">
                                <button className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded">Trước</button>
                                <button className="px-2 py-1 bg-[#C69C6D] text-black rounded font-bold">1</button>
                                <button className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded">Sau</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    </div>
  );

  if (isChildComponent) return <div className="w-full h-full bg-[#050505] overflow-hidden"><MainContent /></div>;
  if (!user) return null;

  return (
    <KhungTrangChuan nguoiDung={user} loiChao={`Xin chào Quản Lý, ${user.ho_ten}`} contentClassName="flex flex-col h-screen pt-28 pb-10 px-6 max-w-[1920px] mx-auto">
      <div className="fixed top-24 left-0 right-0 z-[40] flex justify-center pointer-events-none">
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-auto flex gap-1 overflow-x-auto max-w-[90vw] scrollbar-hide">
             {ROOM_TABS.map((tab) => (
                <button key={tab.key} onClick={() => handleRoomTabClick(tab.key, tab.path, tab.available)} disabled={!tab.available} className={`text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all py-2 px-6 rounded-full relative ${tab.key === 'quanly' ? 'bg-[#C69C6D] text-black shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'} ${!tab.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>{tab.label}</button>
             ))}
        </div>
      </div>
      <MainContent />
    </KhungTrangChuan>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ChevronDown, 
  ChevronRight,
  Building2, // Icon cho nhóm Phòng Ban
  Image as ImageIcon,
  Settings,
  ChevronUp
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function CacNutBam({ onClose }: Props) {
  const pathname = usePathname();
  
  // Trạng thái mở/đóng của nhóm Phòng Ban (Mặc định mở để dễ thấy)
  const [moPhongBan, setMoPhongBan] = useState(true);

  // 1. DANH SÁCH CÁC PHÒNG CON (Không icon)
  const danhSachPhong = [
    { name: 'Phòng Quản Lý', href: '/phongquanly' },
    { name: 'Phòng Sales', href: '/phongsales' },
    { name: 'Phòng Sản Xuất', href: '/phongsanxuat' },
    { name: 'Phòng Part-time', href: '/phongparttime' },
    { name: 'Phòng Cộng Tác Viên', href: '/phongcongtacvien' },
  ];

  return (
    <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar select-none">
      
     



      {/* --- MỤC 3: CÁC TRANG KHÁC --- */}
      <Link 
        href="/phongtrungbay" 
        onClick={onClose}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
          ${pathname.startsWith('/phongtrungbay') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}
        `}
      >
        <ImageIcon size={20} />
        <span>PHÒNG TRƯNG BÀY</span>
      </Link>

             {/* --- MỤC 2: NHÓM PHÒNG BAN (ACCORDION) --- */}
      <div className="mb-4">
        {/* Nút kích hoạt xổ xuống */}
        <button
          onClick={() => setMoPhongBan(!moPhongBan)}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
            ${pathname.startsWith('/phong') ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
          `}
        >
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-gray-500 group-hover:text-white transition-colors" />
            <span className="uppercase tracking-wider text-xs font-bold">PHÒNG BAN</span>
          </div>
          {/* Mũi tên xoay */}
          {moPhongBan ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Danh sách con (Chỉ hiện khi moPhongBan = true) */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${moPhongBan ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col space-y-0.5 ml-3 border-l border-white/10 pl-3">
                {danhSachPhong.map((phong) => {
                    const isActive = pathname.startsWith(phong.href);
                    return (
                        <Link
                            key={phong.href}
                            href={phong.href}
                            onClick={onClose}
                            className={`
                                block py-2 px-3 rounded-md text-sm transition-all duration-200 relative
                                ${isActive 
                                    ? 'text-white bg-white/10 font-medium translate-x-1' 
                                    : 'text-gray-500 hover:text-gray-300 hover:translate-x-1'
                                }
                            `}
                        >
                            {/* Dấu chấm tròn nhỏ khi active */}
                            {isActive && <span className="absolute left-[-17px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>}
                            
                            {phong.name}
                        </Link>
                    )
                })}
            </div>
        </div>
      </div>


    </div>
  );
}
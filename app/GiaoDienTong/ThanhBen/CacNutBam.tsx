'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Settings, 
  ShieldCheck,
  Briefcase,
  Box
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function CacNutBam({ onClose }: Props) {
  const pathname = usePathname();

  // 1. MENU MẶC ĐỊNH (Hiển thị chung cho toàn hệ thống)
  const menuChinh = [
    {
      name: 'Phòng Làm Việc',
      href: '/', 
      icon: LayoutDashboard,
      active: pathname === '/'
    },
    {
      name: 'Phòng Quản Lý',
      href: '/phongquanly',
      icon: ShieldCheck,
      active: pathname.startsWith('/phongquanly')
    },
    {
      name: 'Phòng Trưng Bày',
      href: '/phongtrungbay',
      icon: ImageIcon,
      active: pathname.startsWith('/phongtrungbay')
    },
    {
      name: 'Demo Tinh Chỉnh',
      href: '/phongdemo',
      icon: Settings,
      active: pathname.startsWith('/phongdemo')
    },
  ];

  // 2. MENU RIÊNG CHO PHÒNG DEMO (Ví dụ ông muốn phòng demo có nút khác)
  // Logic: Nếu đang ở /phongdemo thì hiển thị thêm các nút con này
  const menuDemo = [
     // Ông có thể thêm các nút đặc biệt chỉ dành cho phòng demo vào đây
     // Ví dụ: Reset Demo, Test Nút...
  ];

  // 🟢 LOGIC CHỌN MENU:
  // Hiện tại ta dùng menuChinh cho tất cả. 
  // Sau này ông muốn trang nào hiện nút riêng thì if/else ở đây.
  const danhSachHienThi = menuChinh;

  return (
    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
      {danhSachHienThi.map((item) => {
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            onClick={onClose} 
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
              ${item.active 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <Icon size={20} className={`transition-colors ${item.active ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
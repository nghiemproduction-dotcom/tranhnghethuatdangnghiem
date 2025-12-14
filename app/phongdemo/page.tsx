'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, Users, Package, Bell, LayoutGrid, ArrowRight, TrendingUp } from 'lucide-react'; 
import { supabase } from '../ThuVien/ketNoiSupabase'; 

// Import nội dung cũ cho Desktop
import BangChinh from './KhuVucChuaModule/BangChinh';

// Map icon: Tăng kích thước mặc định lên size={36} cho to rõ trên mobile
const iconMap: any = {
  dollar: <DollarSign size={36} />,
  users: <Users size={36} />,
  package: <Package size={36} />,
  bell: <Bell size={36} />,
  default: <LayoutGrid size={36} />
};

export default function PhongDemo() {
  const [mobileModules, setMobileModules] = useState<any[]>([]);

  useEffect(() => {
    const fetchMobileConfig = async () => {
      try {
        const { data } = await supabase
          .from('cauhinh_mobile')
          .select('module_list')
          .single();

        if (data?.module_list) {
          setMobileModules(data.module_list);
        }
      } catch (err) {
        console.error("Lỗi tải cấu hình mobile:", err);
      }
    };
    fetchMobileConfig();
  }, []);

  return (
    <div className="w-full min-h-full bg-[#101010] text-white">
        
        {/* ==========================================================
            PHẦN 1: GIAO DIỆN MOBILE (Tối ưu hiển thị TO RÕ)
        ========================================================== */}
        <div className="block md:hidden pb-10">
            
            {/* Header Mobile */}
            <div className="mb-6 px-4 pt-2">
                <h2 className="text-3xl font-bold text-white mb-1">
                    Tổng quan
                </h2>
                <p className="text-gray-400 text-base">Cập nhật hoạt động xưởng</p>
            </div>

            {/* GRID 2 CỘT: Module Cao & To (aspect-[4/5]) */}
            <div className="grid grid-cols-2 gap-4 px-4">
                {mobileModules.length > 0 ? (
                    mobileModules.map((mod: any, idx: number) => (
                        <div key={idx} className="bg-[#1E1E1E] border border-white/10 rounded-3xl p-5 aspect-[4/5] flex flex-col justify-between shadow-lg active:scale-95 transition-transform">
                             
                             {/* Icon to nằm trong khối màu */}
                             <div className={`${mod.color || 'bg-gray-700'} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                 {iconMap[mod.icon] || iconMap.default}
                             </div>
                             
                             <div>
                                 {/* Tiêu đề: Font XL (To hơn cũ) */}
                                 <p className="text-gray-400 text-xl font-bold mb-1">{mod.title}</p>
                                 {/* Số liệu: Font 4XL (Rất to) */}
                                 <p className="text-4xl font-black text-white tracking-tight leading-none">{mod.value}</p>
                             </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-10 text-gray-500 border border-dashed border-gray-700 rounded-2xl">
                        <p className="text-lg">Đang tải dữ liệu...</p>
                    </div>
                )}
            </div>

            {/* Phần tin tức bổ sung */}
            <div className="mt-10 px-4">
                 <div className="flex justify-between items-end mb-4">
                    <h3 className="text-2xl font-bold text-gray-200">Tin mới</h3>
                    <span className="text-blue-500 font-bold text-base flex items-center">Xem tất cả <ArrowRight size={18} className="ml-1"/></span>
                 </div>
                 
                 <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-white/5 flex items-center gap-4 active:bg-[#252525]">
                    <div className="bg-blue-900/20 p-4 rounded-xl text-blue-400 shrink-0">
                        <Bell size={28}/>
                    </div>
                    <div>
                        <p className="font-bold text-lg leading-tight">Hệ thống ổn định</p>
                        <p className="text-base text-gray-500 mt-1">Báo cáo tự động • Vừa xong</p>
                    </div>
                 </div>
            </div>

        </div>

        {/* ==========================================================
            PHẦN 2: GIAO DIỆN DESKTOP (Giữ nguyên BangChinh cũ)
        ========================================================== */}
        <div className="hidden md:block">
            <BangChinh />
        </div>

    </div>
  );
}
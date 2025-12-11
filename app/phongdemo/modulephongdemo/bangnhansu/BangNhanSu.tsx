'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 
import { NhanSu } from './KieuDuLieu';

// Import các file con
import BieuDoThongKe from './BieuDoThongKe';
import ModalChiTiet from './ModalChiTiet';

export default function BangNhanSu() {
  const [danhSach, setDanhSach] = useState<NhanSu[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [moModal, setMoModal] = useState(false);

  // Hàm tải dữ liệu
  const layDuLieu = async () => {
    try {
      if (!supabase) throw new Error("Không tìm thấy cấu hình Supabase.");
      const { data, error } = await supabase.from('nhan_su').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      if (data) setDanhSach(data as NhanSu[]);
    } catch (err: any) {
      console.error(err);
      setLoi(err.message);
    } finally {
      setDangTai(false);
    }
  };

  // Realtime
  useEffect(() => {
    layDuLieu();
    const sub = supabase.channel('ns-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'nhan_su' }, () => layDuLieu()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  // Xử lý Loading
  if (dangTai) return <div className="flex h-full items-center justify-center text-gray-500"><Loader2 className="animate-spin" /></div>;
  
  // Xử lý Lỗi
  if (loi) return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center">
          <AlertCircle size={24} className="mb-2" />
          <span className="text-xs">{loi}</span>
      </div>
  );

  return (
    <>
        {/* Module hiển thị bên ngoài */}
        <BieuDoThongKe data={danhSach} onClick={() => setMoModal(true)} />

        {/* Modal hiển thị chi tiết khi bấm vào */}
        <ModalChiTiet 
            isOpen={moModal} 
            onClose={() => setMoModal(false)} 
            data={danhSach} 
            onRefresh={layDuLieu} 
        />
    </>
  );
}
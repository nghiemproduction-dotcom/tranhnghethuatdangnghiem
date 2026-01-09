'use server'; // 🟢 QUAN TRỌNG: Biến file này thành Server Action

import { cache } from 'react';
import { createClient } from '@/app/ThuVien/supabase/server';
import { KhachHang } from './config';

// Sử dụng cache để nếu Admin gọi, Sales gọi thì cũng chỉ query 1 lần trong 1 request
export const getKhachHangList = cache(async (): Promise<KhachHang[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('khach_hang')
    .select('*')
    .order('tao_luc', { ascending: false });

  if (error) {
    console.error("Lỗi lấy danh sách khách hàng:", error);
    return [];
  }

  return (data || []) as KhachHang[];
});
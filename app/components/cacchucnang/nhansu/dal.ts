'use server'; // 🟢 QUAN TRỌNG: Biến file này thành Server Action

import { cache } from 'react';
import { createClient } from '@/app/ThuVien/supabase/server';
import { NhanSu } from './config';

// Sử dụng cache của React để Request Memoization (nếu gọi nhiều lần cũng chỉ tốn 1 query)
export const getNhanSuList = cache(async (): Promise<NhanSu[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('nhan_su')
    .select('*') // Lấy toàn bộ thông tin nhân sự
    .order('tao_luc', { ascending: false });

  if (error) {
    console.error("Error fetching Nhan Su:", error);
    return [];
  }

  // Map dữ liệu nếu cần (ở đây giả sử DB khớp với Interface NhanSu)
  return (data || []) as NhanSu[];
});
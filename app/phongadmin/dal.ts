import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import React from 'react';

const maybeCache = (React as any).cache ?? ((fn: any) => fn);

// Chỉ lấy thông tin User hiện tại để hiển thị xin chào
export const getAdminProfile = maybeCache(async () => {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Lấy thêm role nếu cần hiển thị
  const { data: staff } = await supabase
    .from('nhan_su')
    .select('ho_ten, vi_tri_normalized')
    .eq('email', user.email)
    .single();

  return staff;
});
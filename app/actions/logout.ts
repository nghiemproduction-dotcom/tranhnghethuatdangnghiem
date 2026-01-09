'use server'

import { cookies } from 'next/headers'

export async function logoutSystem() {
  const cookieStore = cookies();
  
  // Cách 1: Xóa theo chuẩn Next.js mới
  cookieStore.delete('staff_session');
  
  // Cách 2: Bồi thêm lệnh set maxAge = 0 với path cụ thể (để chắc chắn)
  cookieStore.set({
    name: 'staff_session',
    value: '',
    path: '/',
    maxAge: 0,
    expires: new Date(0), 
  });

  return { success: true };
}
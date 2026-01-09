'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function loginWithCode(code: string) {
  // 1. In ra mã nhận được để kiểm tra xem có bị dính khoảng trắng không
  console.log("--- BẮT ĐẦU ĐĂNG NHẬP ---");
  console.log("1. Mã nhận được từ client:", `"${code}"`); // In trong dấu nháy để thấy khoảng trắng

  const cleanCode = code.trim(); // Cắt bỏ khoảng trắng thừa cho chắc ăn
  console.log("2. Mã sau khi làm sạch:", `"${cleanCode}"`);

  const supabase = await createClient();

  // 3. Gọi Database
  const { data: user, error } = await supabase
    .from('nhan_su')
    .select('*')
    .eq('madangnhap', cleanCode) // So sánh chính xác
    .single();

  // 4. In kết quả trả về từ Supabase
  console.log("3. Kết quả tìm kiếm User:", user);
  console.log("4. Lỗi Supabase (nếu có):", error);

  // Xử lý logic như cũ
  if (error || !user) {
    console.log("--- KẾT THÚC: THẤT BẠI (Không tìm thấy) ---");
    return { success: false, message: 'Mã không tồn tại hoặc sai!' };
  }

  if (user.trang_thai !== 'dang_lam_viec') {
    console.log("--- KẾT THÚC: THẤT BẠI (Bị khóa) ---");
    return { success: false, message: 'Tài khoản đã bị khóa!' };
  }

  // Đăng nhập thành công
  const cookieStore = cookies();
  const sessionData = {
    id: user.id,
    role: user.phan_loai,
    name: user.ho_ten,
    avatar: user.hinh_anh
  };

  cookieStore.set('staff_session', JSON.stringify(sessionData), { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7 ,
    path: '/'
    
  });

  let redirectUrl = '/dashboard';
  switch (user.phan_loai) {
    case 'admin': redirectUrl = '/phongadmin'; break;
    case 'sales': redirectUrl = '/dathang'; break;
    case 'thosanxuat': redirectUrl = '/sanxuat'; break;
    case 'thietke': redirectUrl = '/thietke'; break;
    default: redirectUrl = '/dashboard';
  }

  console.log("--- KẾT THÚC: THÀNH CÔNG ->", redirectUrl);
  return { success: true, redirectUrl };
}
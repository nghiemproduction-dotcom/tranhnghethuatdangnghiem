'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function loginWithCode(code: string) {
  // 1. In ra mã nhận được để kiểm tra
  console.log("--- BẮT ĐẦU ĐĂNG NHẬP ---");
  console.log("1. Mã nhận được từ client:", `"${code}"`);

  const cleanCode = code.trim();
  console.log("2. Mã sau khi làm sạch:", `"${cleanCode}"`);

  const supabase = await createClient();

  // 3. Gọi Database
  const { data: user, error } = await supabase
    .from('nhan_su')
    .select('*')
    .eq('madangnhap', cleanCode)
    .single();

  // 4. In kết quả trả về từ Supabase
  console.log("3. Kết quả tìm kiếm User:", user);
  console.log("4. Lỗi Supabase (nếu có):", error);

  // Xử lý logic kiểm tra
  if (error || !user) {
    console.log("--- KẾT THÚC: THẤT BẠI (Không tìm thấy) ---");
    return { success: false, message: 'Mã không tồn tại hoặc sai!' };
  }

  if (user.trang_thai !== 'dang_lam_viec') {
    console.log("--- KẾT THÚC: THẤT BẠI (Bị khóa) ---");
    return { success: false, message: 'Tài khoản đã bị khóa!' };
  }

  // 5. Đăng nhập thành công -> Set Cookie
  // Lưu ý: Thêm 'await' trước cookies() cho chuẩn Next.js 15
  const cookieStore = await cookies();
  
  const sessionData = {
    id: user.id,
    role: user.phan_loai,
    name: user.ho_ten,
    avatar: user.hinh_anh
  };

  cookieStore.set('staff_session', JSON.stringify(sessionData), { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 tuần
    path: '/'
  });

  // 🔴 THAY ĐỔI QUAN TRỌNG TẠI ĐÂY:
  // Bỏ hết switch case cũ. Tất cả mọi người đều về 'phonglamviec'
  const redirectUrl = '/phonglamviec';

  console.log("--- KẾT THÚC: THÀNH CÔNG ->", redirectUrl);
  return { success: true, redirectUrl };
}
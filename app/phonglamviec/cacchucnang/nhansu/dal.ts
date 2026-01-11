// app/phonglamviec/cacchucnang/nhansu/dal.ts
import 'server-only' 
import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import { NhanSuDTO, toNhanSuDTO } from './dto'

export const getDsNhanSu = cache(async (): Promise<NhanSuDTO[]> => {
  console.log("--- DAL: Fetching Nhân Sự ---");
  const supabase = await createClient();
  
  // 1. Check quyền
  const { data: { user } } = await supabase.auth.getUser();
  let isVip = false;
  
  if (user) {
    const { data: currentUserInfo } = await supabase
      .from('nhan_su')
      .select('phan_loai')
      .eq('id', user.id)
      .single();
    
    // Xử lý an toàn khi không tìm thấy user info
    const role = currentUserInfo?.phan_loai || '';
    const safeRole = role.toLowerCase().trim();
    isVip = safeRole === 'admin' || safeRole === 'quan_ly';
  }

  // 2. Query DB
  // ⚠️ LƯU Ý: Nếu DB của bạn chưa có cột 'cap_bac_game', hãy xóa nó khỏi chuỗi bên dưới tạm thời
  const columnsToSelect = isVip 
    ? '*' 
    : 'id, ho_ten, phan_loai, so_dien_thoai, hinh_anh, cap_bac_game, diem_cong_hien';
  
  const { data, error } = await supabase
    .from('nhan_su')
    .select(columnsToSelect)
    .order('tao_luc', { ascending: false });

  if (error) {
    // 🔥 QUAN TRỌNG: Kiểm tra Terminal xem có lỗi này không
    console.error("❌ DAL Error (Lỗi lấy dữ liệu):", error.message); 
    return [];
  }

  // 3. Map sang DTO
  return (data || []).map(toNhanSuDTO);
})